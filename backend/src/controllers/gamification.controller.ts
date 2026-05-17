import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMyProgress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const planRes = await pool.query(
      `SELECT total_xp, current_level FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [req.user?.id],
    );

    const allBadgesRes = await pool.query(
      "SELECT id, name, icon_url, xp_reward, condition_type FROM Badges",
    );

    const earnedBadgesRes = await pool.query(
      "SELECT badge_id, awarded_at FROM User_Badges WHERE user_id = $1",
      [req.user?.id],
    );

    const earnedMap = new Map(
      earnedBadgesRes.rows.map((b: any) => [b.badge_id, b.awarded_at]),
    );

    const badges = allBadgesRes.rows.map((b: any) => ({
      ...b,
      earned: earnedMap.has(b.id),
      awarded_at: earnedMap.get(b.id) || null,
    }));

    res.json({
      xp: planRes.rows[0]?.total_xp || 0,
      level: planRes.rows[0]?.current_level || 1,
      badges: badges,
    });
  } catch (error) {
    console.error("GetProgress Error:", error);
    res.status(500).json({ message: "Ошибка получения прогресса" });
  }
};
