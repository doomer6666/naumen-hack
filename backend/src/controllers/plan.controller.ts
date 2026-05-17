import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import { transitionJiraTicket } from "./jira.service";

const awardBadge = async (userId: string, conditionType: string) => {
  try {
    const badgeRes = await pool.query(
      "SELECT id, xp_reward FROM Badges WHERE condition_type = $1",
      [conditionType],
    );

    if (badgeRes.rows.length > 0) {
      const badge = badgeRes.rows[0];
      const inserted = await pool.query(
        `INSERT INTO User_Badges (user_id, badge_id) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, badge_id) DO NOTHING
         RETURNING *`,
        [userId, badge.id],
      );

      if (inserted.rows.length > 0) {
        await pool.query(
          `UPDATE User_Plans SET total_xp = total_xp + $1 WHERE user_id = $2`,
          [badge.xp_reward, userId],
        );
      }
    }
  } catch (err) {
    console.error("Ошибка начисления бейджа:", err);
  }
};

export const getMyPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const planRes = await pool.query(
      `SELECT id, template_id, mentor_id, status, current_level, total_xp 
       FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [req.user?.id],
    );

    if (planRes.rows.length === 0) {
      res.status(404).json({ message: "Активный план не найден" });
      return;
    }

    const plan = planRes.rows[0];

    const tasksRes = await pool.query(
      `SELECT ut.id as user_task_id, tt.title, tt.description, ut.status, ut.jira_issue_key, ut.mentor_comment, ts.title as stage_title, ts.order_index
   FROM User_Tasks ut
   JOIN Template_Tasks tt ON ut.template_task_id = tt.id
   JOIN Template_Stages ts ON tt.stage_id = ts.id
   WHERE ut.user_plan_id = $1
   ORDER BY ts.order_index, tt.order_index`,
      [plan.id],
    );

    res.json({ ...plan, tasks: tasksRes.rows });
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения плана" });
  }
};

export const updateMyTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;

  // Сотрудник может только отправить на проверку
  if (status !== "in_review") {
    res
      .status(403)
      .json({ message: "Вы можете только отправить задачу на проверку" });
    return;
  }

  try {
    // Проверяем, что задача принадлежит этому сотруднику
    const taskInfoRes = await pool.query(
      `SELECT ut.jira_issue_key, ut.status FROM User_Tasks ut
       JOIN User_Plans up ON ut.user_plan_id = up.id
       WHERE ut.id = $1 AND up.user_id = $2`,
      [taskId, req.user?.id],
    );

    if (taskInfoRes.rows.length === 0) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }

    if (taskInfoRes.rows[0].status !== "pending") {
      res
        .status(400)
        .json({ message: "Задача уже отправлена на проверку или выполнена" });
      return;
    }

    const jiraKey = taskInfoRes.rows[0].jira_issue_key;

    // Обновляем статус
    const result = await pool.query(
      `UPDATE User_Tasks SET status = 'in_review', mentor_comment = NULL WHERE id = $1 RETURNING *`,
      [taskId],
    );

    // Асинхронно двигаем тикет в Jira (не ломаем запрос, если Jira упала)
    if (jiraKey) {
      transitionJiraTicket(jiraKey, "In Review").catch((err) =>
        console.error("Jira transition error (In Review):", err),
      );
    }

    res.json({ ...result.rows[0], jira_issue_key: jiraKey });
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);
    res.status(500).json({ message: "Ошибка обновления задачи" });
  }
};
