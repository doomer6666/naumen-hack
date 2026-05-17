import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Получить прогресс и все бейджи (заработанные и нет)
export const getMyProgress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Получаем XP и уровень
    const planRes = await pool.query(
      `SELECT total_xp, current_level FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [userId],
    );
    const xp = planRes.rows[0]?.total_xp || 0;
    const level = planRes.rows[0]?.current_level || 1;

    // Получаем ВСЕ бейджи из базы
    const allBadgesRes = await pool.query(
      `SELECT id, name, icon, xp_reward FROM Badges`,
    );

    // Получаем ЗАРАБОТАННЫЕ бейджи пользователем
    const earnedRes = await pool.query(
      `SELECT badge_id FROM User_Badges WHERE user_id = $1`,
      [userId],
    );
    const earnedIds = new Set(earnedRes.rows.map((r) => r.badge_id));

    // Формируем итоговый список (добавляем флаг earned и приводим icon к icon_url для фронтенда)
    const badges = allBadgesRes.rows.map((b) => ({
      id: b.id,
      name: b.name,
      icon_url: b.icon, // Фронтенд ждет icon_url
      xp_reward: b.xp_reward,
      earned: earnedIds.has(b.id),
    }));

    res.json({ xp, level, badges });
  } catch (error) {
    console.error("Ошибка получения прогресса:", error);
    res.status(500).json({ message: "Ошибка получения прогресса" });
  }
};

// Получить лидерборд
export const getLeaderboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, up.current_level as level, up.total_xp as xp
       FROM Users u
       JOIN User_Plans up ON u.id = up.user_id
       WHERE u.role = 'newbie' AND up.status = 'in_progress'
       ORDER BY up.total_xp DESC
       LIMIT 10`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения лидерборда:", error);
    res.status(500).json({ message: "Ошибка получения лидерборда" });
  }
};
