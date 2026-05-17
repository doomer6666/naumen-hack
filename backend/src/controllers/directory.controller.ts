import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getDirectoryUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, position, avatar_url FROM Users ORDER BY name",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения пользователей" });
  }
};

export const getDirectoryTree = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT id, name, parent_id, head_user_id FROM Departments ORDER BY name",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения дерева отделов" });
  }
};
