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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Удаляем старый активный план (если он был). Каскадно удалятся и задачи.
    await client.query(
      `DELETE FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [userId],
    );

    // 2. Создаем новый план
    const planRes = await client.query(
      `INSERT INTO User_Plans (id, user_id, template_id, mentor_id, status) 
       VALUES (gen_random_uuid(), $1, $2, $3, 'in_progress') RETURNING id`,
      [userId, template_id, mentor_id || null],
    );
    const planId = planRes.rows[0].id;

    // 3. Получаем задачи шаблона
    const tasksRes = await client.query(
      `SELECT tt.id, tt.title, tt.description, tt.jira_summary 
       FROM Template_Tasks tt
       JOIN Template_Stages ts ON tt.stage_id = ts.id
       WHERE ts.template_id = $1`,
      [template_id],
    );

    let jiraTicketsCreated = 0;
    for (const task of tasksRes.rows) {
      let jiraIssueKey = null;

      if (task.jira_summary) {
        console.log(`[JIRA] Попытка создать тикет: "${task.jira_summary}"`);
        jiraIssueKey = await createJiraTicket(
          task.jira_summary,
          task.description || task.title,
        );

        if (jiraIssueKey) {
          console.log(`[JIRA] Тикет успешно создан: ${jiraIssueKey}`);
          jiraTicketsCreated++;
        } else {
          console.error(
            `[JIRA] ОШИБКА: Тикет не создан для "${task.jira_summary}". Проверь токен, URL проекта и права доступа.`,
          );
        }
      } else {
        console.warn(
          `[JIRA] У задачи "${task.title}" нет поля jira_summary. Пропуск создания тикета.`,
        );
      }

      await client.query(
        `INSERT INTO User_Tasks (user_plan_id, template_task_id, status, jira_issue_key)
         VALUES ($1, $2, 'pending', $3)`,
        [planId, task.id, jiraIssueKey],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "План назначен",
      plan_id: planId,
      jira_tickets_created: jiraTicketsCreated,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Ошибка назначения плана:", error);
    res.status(500).json({ message: "Ошибка назначения плана" });
  } finally {
    client.release();
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
    const result = await pool.query(`
      SELECT u.id, u.name, u.position, u.email, 
             up.status as plan_status, up.start_date,
             m.name as mentor_name
      FROM Users u
      LEFT JOIN LATERAL (
        SELECT status, start_date, mentor_id 
        FROM User_Plans 
        WHERE user_id = u.id 
        ORDER BY created_at DESC LIMIT 1
      ) up ON true
      LEFT JOIN Users m ON up.mentor_id = m.id
      WHERE u.role = 'newbie'
      ORDER BY u.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения сотрудников:", error);
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
  if (req.user?.role !== "hr" && req.user?.role !== "mentor") {
    res.status(403).json({ message: "Нет доступа" });
    return;
  }

  const { id: userId } = req.params;

  try {
    // Получаем имя сотрудника сразу
    const userRes = await pool.query("SELECT name FROM Users WHERE id = $1", [
      userId,
    ]);
    const userName = userRes.rows[0]?.name || "Сотрудник";

    const planRes = await pool.query(
      `SELECT id, mentor_id, status FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [userId],
    );

    if (planRes.rows.length === 0) {
      res.status(404).json({ message: "План не найден" });
      return;
    }

    const plan = planRes.rows[0];

    let mentorName = null;
    if (plan.mentor_id) {
      const mentorRes = await pool.query(
        "SELECT name FROM Users WHERE id = $1",
        [plan.mentor_id],
      );
      if (mentorRes.rows.length > 0) mentorName = mentorRes.rows[0].name;
    }

    const tasksRes = await pool.query(
      `SELECT ut.id as user_task_id, tt.title, tt.description, ut.status, ut.jira_issue_key, ut.mentor_comment, ts.title as stage_title, ts.order_index
       FROM User_Tasks ut
       JOIN Template_Tasks tt ON ut.template_task_id = tt.id
       JOIN Template_Stages ts ON tt.stage_id = ts.id
       WHERE ut.user_plan_id = $1
       ORDER BY ts.order_index, tt.order_index`,
      [plan.id],
    );

    // ВАЖНО: добавляем user_name в ответ
    res.json({
      plan_id: plan.id,
      mentor_id: plan.mentor_id,
      mentor_name: mentorName,
      status: plan.status,
      user_name: userName,
      tasks: tasksRes.rows,
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

export const getHrAnalytics = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    // 1. Метрики по планам
    const plansRes = await pool.query(
      `SELECT status, COUNT(*) as count FROM User_Plans GROUP BY status`,
    );
    let active = 0;
    let completedCount = 0;
    plansRes.rows.forEach((r: any) => {
      if (r.status === "in_progress") active = parseInt(r.count, 10);
      if (r.status === "completed") completedCount = parseInt(r.count, 10);
    });
    const totalPlans = active + completedCount;
    const passRate =
      totalPlans > 0 ? Math.round((completedCount / totalPlans) * 100) : 0;

    // 2. Удовлетворенность (средний пульс * 10)
    const moodRes = await pool.query(
      `SELECT AVG(mood_score) as avg FROM Feedback_Responses`,
    );
    const avgMood = parseFloat(moodRes.rows[0]?.avg || "0");
    const satisfaction = Math.round(avgMood * 10);

    // 3. Средний прогресс задач
    const taskRes = await pool.query(`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE ut.status = 'done') as done 
      FROM User_Tasks ut 
      JOIN User_Plans up ON ut.user_plan_id = up.id 
      WHERE up.status = 'in_progress'
    `);
    const taskTotal = parseInt(taskRes.rows[0].total, 10) || 1;
    const taskDone = parseInt(taskRes.rows[0].done, 10) || 0;
    const avgProgress = Math.round((taskDone / taskTotal) * 100);

    // 4. Сотрудники под угрозой (разбиваем на 2 простых запроса)
    const usersRes = await pool.query(`
      SELECT u.id, u.name, u.position,
             COUNT(ut.id) as total_tasks,
             COUNT(ut.id) FILTER (WHERE ut.status = 'done') as done_tasks
      FROM Users u
      JOIN User_Plans up ON u.id = up.user_id AND up.status = 'in_progress'
      LEFT JOIN User_Tasks ut ON up.id = ut.user_plan_id
      WHERE u.role = 'newbie'
      GROUP BY u.id, u.name, u.position
    `);

    const moodsRes = await pool.query(
      `SELECT user_id, mood_score FROM Feedback_Responses`,
    );
    const moodMap = new Map(
      moodsRes.rows.map((m: any) => [m.user_id, m.mood_score]),
    );

    const atRisk = usersRes.rows
      .filter((u: any) => {
        const total = parseInt(u.total_tasks, 10) || 1;
        const done = parseInt(u.done_tasks, 10) || 0;
        const progress = (done / total) * 100;
        const mood = moodMap.get(u.id);
        return (mood && mood < 5) || progress < 30;
      })
      .map((u: any) => {
        const total = parseInt(u.total_tasks, 10) || 1;
        const done = parseInt(u.done_tasks, 10) || 0;
        const progress = Math.round((done / total) * 100);
        const mood = moodMap.get(u.id);

        let issue = `Прогресс: ${progress}%`;
        if (mood && mood < 5) issue = `Низкий пульс: ${mood}/10`;

        return {
          id: u.id,
          name: u.name,
          role: u.position || "Сотрудник",
          issue,
        };
      });

    res.json({ active, passRate, satisfaction, avgProgress, atRisk });
  } catch (error) {
    console.error("=== АНАЛИТИКА ОШИБКА ===", error);
    res.status(500).json({ message: "Ошибка аналитики" });
  }
};
