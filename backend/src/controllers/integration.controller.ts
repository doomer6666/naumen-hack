import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Webhook от Jira
export const jiraWebhook = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { issue_key, status } = req.body;

  if (status !== "Done") {
    res.status(200).json({ message: "Игнорируем, статус не Done" });
    return;
  }

  try {
    // Находим задачу пользователя по Jira Issue Key
    const taskRes = await pool.query(
      `UPDATE User_Tasks SET status = 'done', completed_at = NOW() 
       WHERE jira_issue_key = $1 RETURNING user_plan_id, template_task_id`,
      [issue_key],
    );

    if (taskRes.rows.length > 0) {
      const planId = taskRes.rows[0].user_plan_id;
      // Начисляем XP за интеграцию
      await pool.query(
        `UPDATE User_Plans SET total_xp = total_xp + 20 WHERE id = $1`,
        [planId],
      );
    }

    res.status(200).json({ message: "Задача обновлена из Jira" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка вебхука Jira" });
  }
};

// Заглушка подключения Jira
export const jiraConnect = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  res.json({ auth_url: "https://auth.atlassian.com/authorize?mock=true" });
};
