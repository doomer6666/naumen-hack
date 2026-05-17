import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getDirectoryUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    let mentorId: string | null = null;
    if (currentUserRole === "newbie") {
      const planRes = await pool.query(
        `SELECT mentor_id FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
        [currentUserId],
      );
      mentorId = planRes.rows[0]?.mentor_id || null;
    }

    const usersRes = await pool.query(
      `SELECT id, name, position, department, responsibility, email, phone, telegram, role 
       FROM Users ORDER BY name`,
    );

    const users = usersRes.rows.map((u) => {
      let relation = "colleague";
      if (currentUserRole === "newbie") {
        if (u.role === "hr") relation = "hr";
        if (u.id === mentorId) relation = "mentor";
      }
      return { ...u, relation };
    });

    res.json(users);
  } catch (error) {
    console.error("Ошибка получения справочника:", error);
    res.status(500).json({ message: "Ошибка получения справочника" });
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
