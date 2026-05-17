import { Request, Response } from "express";
import pool from "../config/db";

export const jiraWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const issueKey = req.body.issue?.key;
    const statusName = req.body.issue?.fields?.status?.name;

    if (!issueKey) {
      res.status(400).json({ message: "Нет данных об issue" });
      return;
    }

    const isDone = ["done", "closed", "resolved"].includes(
      statusName?.toLowerCase(),
    );

    if (isDone) {
      const taskRes = await pool.query(
        `UPDATE User_Tasks SET status = 'done', completed_at = NOW() 
         WHERE jira_issue_key = $1 AND status != 'done'
         RETURNING user_plan_id`,
        [issueKey],
      );

      if (taskRes.rows.length > 0) {
        const planId = taskRes.rows[0].user_plan_id;

        await pool.query(
          `UPDATE User_Plans SET total_xp = total_xp + 20 WHERE id = $1`,
          [planId],
        );
        console.log(
          `Jira Webhook: Задача ${issueKey} закрыта, +20 XP начислен.`,
        );
      }
    } else {
      console.log(
        `Jira Webhook: Задача ${issueKey} перешла в статус ${statusName}. Игнорируем.`,
      );
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Ошибка вебхука Jira:", error);
    res.status(500).json({ message: "Ошибка вебхука" });
  }
};

export const jiraConnect = async (req: any, res: Response): Promise<void> => {
  res.json({ auth_url: "https://auth.atlassian.com/authorize?mock=true" });
};
