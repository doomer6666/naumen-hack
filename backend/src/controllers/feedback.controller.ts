import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

const awardBadge = async (userId: string, conditionType: string) => {
  try {
    const badgeRes = await pool.query(
      "SELECT id, xp_reward FROM Badges WHERE condition_type = $1",
      [conditionType],
    );
    if (badgeRes.rows.length > 0) {
      const badge = badgeRes.rows[0];
      const inserted = await pool.query(
        `INSERT INTO User_Badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT (user_id, badge_id) DO NOTHING RETURNING *`,
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

export const getNextFeedback = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const check = await pool.query(
      `SELECT id FROM Feedback_Responses WHERE user_id = $1 AND submitted_at > NOW() - INTERVAL '7 days' LIMIT 1`,
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
      `INSERT INTO Feedback_Responses (user_id, mood_score, clarity_score, has_access, blockers) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user?.id, mood_score, clarity_score, has_access, blockers],
    );
    await pool.query(
      `UPDATE User_Plans SET total_xp = total_xp + 5 WHERE user_id = $1`,
      [req.user?.id],
    );

    const fbCount = await pool.query(
      `SELECT COUNT(*) FROM Feedback_Responses WHERE user_id = $1`,
      [req.user?.id],
    );
    if (parseInt(fbCount.rows[0].count, 10) === 1) {
      await awardBadge(req.user!.id, "feedback_count_1");
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка отправки фидбека" });
  }
};
