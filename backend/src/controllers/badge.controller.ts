import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAvailableBadges = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, icon, xp_reward FROM Badges WHERE condition_type = 'manual'`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения ачивок:", error);
    res.status(500).json({ message: "Ошибка получения ачивок" });
  }
};

export const getMyBadges = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.name, b.icon, b.xp_reward, ub.awarded_at
       FROM User_Badges ub
       JOIN Badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.awarded_at DESC`,
      [req.user?.id],
    );

    const xpRes = await pool.query(
      `SELECT total_xp FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [req.user?.id],
    );

    res.json({
      badges: result.rows,
      total_xp: xpRes.rows[0]?.total_xp || 0,
    });
  } catch (error) {
    console.error("Ошибка получения моих ачивок:", error);
    res.status(500).json({ message: "Ошибка получения ачивок" });
  }
};
