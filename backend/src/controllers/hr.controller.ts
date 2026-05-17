import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import { createJiraTicket } from "./jira.service";

const isHR = (req: AuthRequest, res: Response): boolean => {
  if (req.user?.role !== "hr" && req.user?.role !== "admin") {
    res.status(403).json({ message: "Доступ запрещен" });
    return false;
  }
  return true;
};

// Аналитика
export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const inProgress = await pool.query(
      `SELECT COUNT(*) FROM User_Plans WHERE status = 'in_progress'`,
    );
    const completed = await pool.query(
      `SELECT COUNT(*) FROM User_Plans WHERE status = 'completed'`,
    );
    const avgMood = await pool.query(
      `SELECT AVG(mood_score) FROM Feedback_Responses WHERE submitted_at > NOW() - INTERVAL '7 days'`,
    );

    res.json({
      in_progress: parseInt(inProgress.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      avg_mood: parseFloat(avgMood.rows[0].avg || 0).toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка аналитики" });
  }
};

// Шаблоны (CRUD)
export const getTemplates = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const result = await pool.query(
      "SELECT * FROM Onboarding_Templates ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const assignPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id: userId } = req.params;
  const { template_id, mentor_id } = req.body;

  try {
    const planRes = await pool.query(
      `INSERT INTO User_Plans (user_id, template_id, mentor_id, status) VALUES ($1, $2, $3, 'in_progress') RETURNING id`,
      [userId, template_id, mentor_id || null],
    );
    const planId = planRes.rows[0].id;

    const tasksRes = await pool.query(
      `SELECT tt.id, tt.title, tt.description, tt.jira_summary FROM Template_Tasks tt JOIN Template_Stages ts ON tt.stage_id = ts.id WHERE ts.template_id = $1`,
      [template_id],
    );

    let jiraTicketsCreated = 0;
    for (const task of tasksRes.rows) {
      let jiraIssueKey = null;
      if (task.jira_summary) {
        jiraIssueKey = await createJiraTicket(
          task.jira_summary,
          task.description || task.title,
        );
        if (jiraIssueKey) jiraTicketsCreated++;
      }
      await pool.query(
        `INSERT INTO User_Tasks (user_plan_id, template_task_id, status, jira_issue_key) VALUES ($1, $2, 'pending', $3)`,
        [planId, task.id, jiraIssueKey],
      );
    }

    // Возвращаем информацию о создании тикетов
    res.status(201).json({
      message: "План назначен",
      plan_id: planId,
      jira_tickets_created: jiraTicketsCreated,
    });
  } catch (error) {
    console.error("Ошибка назначения плана:", error);
    res.status(500).json({ message: "Ошибка назначения плана" });
  }
};
// Выгрузка фидбеков
export const getFeedbacks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const result = await pool.query(
      `SELECT fr.*, u.name as user_name FROM Feedback_Responses fr JOIN Users u ON fr.user_id = u.id ORDER BY fr.submitted_at DESC LIMIT 50`,
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения фидбеков" });
  }
};

// Ручное изменение статуса задачи HR-ом
export const hrUpdateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE User_Tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, taskId],
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления задачи HR-ом" });
  }
};

export const getEmployees = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.position, u.email, 
              up.status as plan_status, up.start_date,
              m.name as mentor_name
       FROM Users u
       LEFT JOIN User_Plans up ON u.id = up.user_id AND up.status IN ('in_progress', 'completed')
       LEFT JOIN Users m ON up.mentor_id = m.id
       WHERE u.role = 'newbie'
       ORDER BY u.name`,
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения сотрудников" });
  }
};

export const deleteTemplate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Onboarding_Templates WHERE id = $1", [id]);
    res.json({ message: "Шаблон удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка удаления шаблона" });
  }
};

export const getEmployeePlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id: userId } = req.params;

  try {
    const planRes = await pool.query(
      `SELECT id, mentor_id, status FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [userId],
    );

    if (planRes.rows.length === 0) {
      res.status(404).json({ message: "План не найден" });
      return;
    }

    const plan = planRes.rows[0];

    // Получаем имя наставника
    let mentorName = null;
    if (plan.mentor_id) {
      const mentorRes = await pool.query(
        "SELECT name FROM Users WHERE id = $1",
        [plan.mentor_id],
      );
      if (mentorRes.rows.length > 0) mentorName = mentorRes.rows[0].name;
    }

    // Получаем задачи вместе с ключами Jira
    const tasksRes = await pool.query(
      `SELECT ut.id as user_task_id, tt.title, tt.description, ut.status, ut.jira_issue_key, ts.title as stage_title, ts.order_index
       FROM User_Tasks ut
       JOIN Template_Tasks tt ON ut.template_task_id = tt.id
       JOIN Template_Stages ts ON tt.stage_id = ts.id
       WHERE ut.user_plan_id = $1
       ORDER BY ts.order_index, tt.order_index`,
      [plan.id],
    );

    // Группируем задачи по этапам для фронтенда
    const stagesMap = new Map();
    tasksRes.rows.forEach((task: any) => {
      if (!stagesMap.has(task.stage_title)) {
        stagesMap.set(task.stage_title, {
          id: task.stage_title,
          title: task.stage_title,
          isOpen: true,
          tasks: [],
        });
      }
      stagesMap.get(task.stage_title).tasks.push({
        ...task,
        isCompleted: task.status === "done",
        deadline: task.description || "—",
      });
    });

    res.json({
      plan_id: plan.id,
      mentor_id: plan.mentor_id,
      mentor_name: mentorName,
      status: plan.status,
      stages: Array.from(stagesMap.values()),
    });
  } catch (error) {
    console.error("Ошибка получения плана сотрудника:", error);
    res.status(500).json({ message: "Ошибка получения плана" });
  }
};

// Обновить наставника
export const updateMentor = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id: userId } = req.params;
  const { mentor_id } = req.body;

  try {
    await pool.query(
      `UPDATE User_Plans SET mentor_id = $1 WHERE user_id = $2 AND status = 'in_progress'`,
      [mentor_id || null, userId],
    );
    res.json({ message: "Наставник обновлен" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления наставника" });
  }
};

export const createTemplate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { name, description, duration_days, stages } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const templRes = await client.query(
      `INSERT INTO Onboarding_Templates (id, name, description, duration_days, is_active) 
       VALUES (gen_random_uuid(), $1, $2, $3, true) RETURNING id`,
      [name, description || "", duration_days || 30],
    );
    const templateId = templRes.rows[0].id;

    if (stages && stages.length > 0) {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stageRes = await client.query(
          `INSERT INTO Template_Stages (id, template_id, title, order_index, start_day, end_day) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
          [
            templateId,
            stage.title,
            i + 1,
            stage.start_day || 1,
            stage.end_day || 7,
          ],
        );
        const stageId = stageRes.rows[0].id;

        if (stage.tasks && stage.tasks.length > 0) {
          for (let j = 0; j < stage.tasks.length; j++) {
            const task = stage.tasks[j];
            await client.query(
              `INSERT INTO Template_Tasks (id, stage_id, title, description, type, order_index, jira_summary) 
               VALUES (gen_random_uuid(), $1, $2, $3, 'task', $4, $5)`,
              [
                stageId,
                task.title,
                task.deadline || "",
                j + 1,
                task.jiraTemplate || null,
              ],
            );
          }
        }
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ id: templateId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Ошибка создания шаблона:", error);
    res.status(500).json({ message: "Ошибка создания шаблона" });
  } finally {
    client.release();
  }
};

// Получить шаблон по ID (с этапами и задачами)
export const getTemplateById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id } = req.params;
  try {
    const templRes = await pool.query(
      "SELECT * FROM Onboarding_Templates WHERE id = $1",
      [id],
    );
    if (templRes.rows.length === 0) {
      res.status(404).json({ message: "Шаблон не найден" });
      return;
    }

    const stagesRes = await pool.query(
      `SELECT * FROM Template_Stages WHERE template_id = $1 ORDER BY order_index`,
      [id],
    );

    const tasksRes = await pool.query(
      `SELECT tt.* FROM Template_Tasks tt 
       JOIN Template_Stages ts ON tt.stage_id = ts.id 
       WHERE ts.template_id = $1 ORDER BY ts.order_index, tt.order_index`,
      [id],
    );

    const stages = stagesRes.rows.map((s) => ({
      ...s,
      tasks: tasksRes.rows.filter((t) => t.stage_id === s.id),
    }));

    res.json({ ...templRes.rows[0], stages });
  } catch (error) {
    console.error("Ошибка получения шаблона:", error);
    res.status(500).json({ message: "Ошибка получения шаблона" });
  }
};

// Полное обновление шаблона (удаление старых этапов/задач и вставка новых)
export const updateTemplate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id } = req.params;
  const { name, description, duration_days, stages } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE Onboarding_Templates SET name = $1, description = $2, duration_days = $3 WHERE id = $4`,
      [name, description, duration_days, id],
    );

    // Удаляем старые этапы (каскадно удалятся и задачи)
    await client.query(`DELETE FROM Template_Stages WHERE template_id = $1`, [
      id,
    ]);

    // Вставляем новые этапы и задачи
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageRes = await client.query(
        `INSERT INTO Template_Stages (id, template_id, title, order_index, start_day, end_day) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
        [id, stage.title, i + 1, stage.start_day || 1, stage.end_day || 7],
      );
      const stageId = stageRes.rows[0].id;

      for (let j = 0; j < stage.tasks.length; j++) {
        const task = stage.tasks[j];
        await client.query(
          `INSERT INTO Template_Tasks (id, stage_id, title, description, type, order_index, jira_summary) 
           VALUES (gen_random_uuid(), $1, $2, $3, 'task', $4, $5)`,
          [
            stageId,
            task.title,
            task.deadline || "",
            j + 1,
            task.jiraTemplate || null,
          ],
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Шаблон обновлен" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Ошибка обновления шаблона:", error);
    res.status(500).json({ message: "Ошибка обновления шаблона" });
  } finally {
    client.release();
  }
};
