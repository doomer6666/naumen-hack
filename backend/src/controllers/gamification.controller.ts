import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMyProgress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Получаем XP и Level
    const planRes = await pool.query(
      `SELECT total_xp, current_level FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [req.user?.id],
    );

    // Получаем бейджи
    const badgesRes = await pool.query(
      `SELECT b.id, b.name, b.icon_url, ub.awarded_at 
       FROM User_Badges ub JOIN Badges b ON ub.badge_id = b.id 
       WHERE ub.user_id = $1`,
      [req.user?.id],
    );

    res.json({
      xp: planRes.rows[0]?.total_xp || 0,
      level: planRes.rows[0]?.current_level || 1,
      badges: badgesRes.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения прогресса" });
  }
};
