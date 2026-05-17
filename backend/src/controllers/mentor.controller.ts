import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMyMentees = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.position, up.status as plan_status,
        COALESCE(COUNT(ut.id), 0) as total_tasks,
        COALESCE(COUNT(ut.id) FILTER (WHERE ut.status = 'done'), 0) as done_tasks,
        (SELECT fr.mood_score FROM Feedback_Responses fr WHERE fr.user_id = u.id ORDER BY fr.submitted_at DESC LIMIT 1) as latest_mood
      FROM User_Plans up
      JOIN Users u ON up.user_id = u.id
      LEFT JOIN User_Tasks ut ON ut.user_plan_id = up.id
      WHERE up.mentor_id = $1 AND up.status IN ('in_progress', 'completed')
      GROUP BY u.id, up.status`,
      [req.user?.id],
    );

    const mentees = result.rows;
    const active = mentees.filter(
      (m: any) => m.plan_status === "in_progress",
    ).length;
    const completed = mentees.filter(
      (m: any) => m.plan_status === "completed",
    ).length;

    res.json({ mentees, stats: { active, completed } });
  } catch (error) {
    console.error("Get Mentees Error:", error);
    res.status(500).json({ message: "Ошибка получения подопечных" });
  }
};
