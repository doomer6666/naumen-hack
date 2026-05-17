import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getNextFeedback = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  // Заглушка: возвращаем статический опрос
  res.json({
    survey_id: "default_weekly",
    questions: [
      { id: 1, text: "Как ваше настроение?", type: "mood_score" },
      { id: 2, text: "Насколько понятны задачи?", type: "clarity_score" },
      { id: 3, text: "Хватает ли доступов?", type: "has_access" },
      { id: 4, text: "Есть ли блокеры?", type: "blockers" },
    ],
  });
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

    // Бонусные XP за прохождение опроса
    await pool.query(
      `UPDATE User_Plans SET total_xp = total_xp + 5 WHERE user_id = $1`,
      [req.user?.id],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка отправки фидбека" });
  }
};
