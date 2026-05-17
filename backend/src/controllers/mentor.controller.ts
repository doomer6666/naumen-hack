import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import { transitionJiraTicket } from "./jira.service";

export const getMyMentees = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.position, 
              up.status as plan_status,
              COUNT(ut.id) as total_tasks,
              COUNT(ut.id) FILTER (WHERE ut.status = 'done') as done_tasks,
              fr.mood_score as latest_mood
       FROM Users u
       JOIN User_Plans up ON u.id = up.user_id AND up.status = 'in_progress'
       LEFT JOIN User_Tasks ut ON up.id = ut.user_plan_id
       LEFT JOIN LATERAL (
         SELECT mood_score FROM Feedback_Responses 
         WHERE user_id = u.id 
         ORDER BY created_at DESC LIMIT 1
       ) fr ON true
       WHERE up.mentor_id = $1
       GROUP BY u.id, u.name, u.position, up.status, fr.mood_score
       ORDER BY u.name`,
      [req.user?.id],
    );

    const stats = { active: result.rows.length, completed: 0 };
    res.json({ mentees: result.rows, stats });
  } catch (error) {
    console.error("Ошибка получения подопечных:", error);
    res.status(500).json({ message: "Ошибка получения подопечных" });
  }
};

export const reviewTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { taskId } = req.params;
  const { status, comment } = req.body;

  if (!["done", "pending"].includes(status)) {
    res
      .status(400)
      .json({ message: "Неверный статус. Используйте 'done' или 'pending'" });
    return;
  }

  try {
    const taskRes = await pool.query(
      `SELECT ut.jira_issue_key, up.mentor_id 
       FROM User_Tasks ut
       JOIN User_Plans up ON ut.user_plan_id = up.id
       WHERE ut.id = $1 AND up.status = 'in_progress'`,
      [taskId],
    );

    if (taskRes.rows.length === 0) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }

    if (taskRes.rows[0].mentor_id !== req.user?.id) {
      res
        .status(403)
        .json({ message: "Вы не являетесь наставником этого сотрудника" });
      return;
    }

    const jiraKey = taskRes.rows[0].jira_issue_key;

    // Обновляем статус задачи
    const dateUpdate = status === "done" ? "NOW()" : "NULL";
    await pool.query(
      `UPDATE User_Tasks SET status = $1, mentor_comment = $2, completed_at = ${dateUpdate} WHERE id = $3`,
      [status, comment || null, taskId],
    );

    // ВАЖНО: Отвечаем клиенту СРАЗУ. Дальнейшие действия не должны ломать запрос.
    res.json({
      message:
        status === "done" ? "Задача принята" : "Задача возвращена на доработку",
    });

    // --- ФОНОВАЯ ЛОГИКА (XP, Jira, Ачивки) ---
    if (status === "done") {
      try {
        if (jiraKey) await transitionJiraTicket(jiraKey, "Done");

        const planRes = await pool.query(
          `SELECT user_id FROM User_Plans WHERE id = (SELECT user_plan_id FROM User_Tasks WHERE id = $1)`,
          [taskId],
        );
        const userId = planRes.rows[0]?.user_id;

        if (userId) {
          await pool.query(
            `UPDATE User_Plans SET total_xp = total_xp + 10 WHERE user_id = $1`,
            [userId],
          );

          const badgeId = req.body.badge_id;
          if (badgeId) {
            await pool.query(
              `INSERT INTO User_Badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [userId, badgeId],
            );
            const badgeRes = await pool.query(
              `SELECT xp_reward FROM Badges WHERE id = $1`,
              [badgeId],
            );
            const bonusXp = badgeRes.rows[0]?.xp_reward || 0;
            if (bonusXp > 0) {
              await pool.query(
                `UPDATE User_Plans SET total_xp = total_xp + $1 WHERE user_id = $2`,
                [bonusXp, userId],
              );
            }
          }

          // Автоматические ачивки
          const stats = await pool.query(
            `SELECT COUNT(*) FILTER (WHERE ut.status = 'done') as done_count, COUNT(*) as total_count
             FROM User_Tasks ut JOIN User_Plans up ON ut.user_plan_id = up.id WHERE up.user_id = $1`,
            [userId],
          );
          const doneCount = parseInt(stats.rows[0].done_count, 10);
          const totalCount = parseInt(stats.rows[0].total_count, 10);

          if (doneCount >= 1) {
            await pool.query(
              `INSERT INTO User_Badges (user_id, badge_id) VALUES ($1, 'a8a1a3b2-4d2d-4f1a-8c9b-6e2c3d4e5f6a') ON CONFLICT DO NOTHING`,
              [userId],
            );
          }
          if (doneCount === totalCount && totalCount > 0) {
            await pool.query(
              `INSERT INTO User_Badges (user_id, badge_id) VALUES ($1, 'b1c2d3e4-5f6a-4b7c-8d9e-0f1e2d3c4b5a') ON CONFLICT DO NOTHING`,
              [userId],
            );
          }
        }
      } catch (bgErr) {
        console.error("[ФОН] Ошибка начисления XP/ачивок:", bgErr);
      }
    } else {
      if (jiraKey) transitionJiraTicket(jiraKey, "To Do").catch(console.error);
    }
  } catch (error) {
    console.error("Ошибка ревью задачи:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Ошибка ревью задачи" });
    }
  }
};

export const getPendingReviews = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT ut.id as task_id, tt.title, u.name as mentee_name, ut.jira_issue_key
       FROM User_Tasks ut
       JOIN User_Plans up ON ut.user_plan_id = up.id
       JOIN Users u ON up.user_id = u.id
       JOIN Template_Tasks tt ON ut.template_task_id = tt.id
       WHERE up.mentor_id = $1 AND ut.status = 'in_review' AND up.status = 'in_progress'
       ORDER BY ut.id DESC`,
      [req.user?.id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения задач на проверку:", error);
    res.status(500).json({ message: "Ошибка получения задач на проверку" });
  }
};
