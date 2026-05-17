import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getNextFeedback = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const check = await pool.query(
      `SELECT id FROM Feedback_Responses 
       WHERE user_id = $1 AND submitted_at > NOW() - INTERVAL '7 days' 
       LIMIT 1`,
      [req.user?.id],
    );

    if (check.rows.length > 0) {
      res.json({ submitted: true });
    } else {
      res.json({
        submitted: false,
        questions: [
          { id: 1, text: "Как ваше настроение?", type: "mood_score" },
          { id: 2, text: "Насколько понятны задачи?", type: "clarity_score" },
          { id: 3, text: "Хватает ли доступов?", type: "has_access" },
          { id: 4, text: "Есть ли блокеры?", type: "blockers" },
        ],
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка проверки опроса" });
  }
};

export const submitFeedback = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { mood_score, clarity_score, has_access, blockers } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Feedback_Responses (user_id, mood_score, clarity_score, has_access, blockers) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user?.id, mood_score, clarity_score, has_access, blockers],
    );

    await pool.query(
      `UPDATE User_Plans SET total_xp = total_xp + 5 WHERE user_id = $1`,
      [req.user?.id],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка отправки фидбека" });
  }
};
