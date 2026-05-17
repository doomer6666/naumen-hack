import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Получить свой план
export const getMyPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const planRes = await pool.query(
      `SELECT id, template_id, mentor_id, status, current_level, total_xp 
       FROM User_Plans WHERE user_id = $1 AND status = 'in_progress'`,
      [req.user?.id],
    );

    if (planRes.rows.length === 0) {
      res.status(404).json({ message: "Активный план не найден" });
      return;
    }

    const plan = planRes.rows[0];

    const tasksRes = await pool.query(
      `SELECT ut.id as user_task_id, tt.id as task_id, tt.title, tt.description, tt.type, ut.status, ts.order_index
       FROM User_Tasks ut
       JOIN Template_Tasks tt ON ut.template_task_id = tt.id
       JOIN Template_Stages ts ON tt.stage_id = ts.id
       WHERE ut.user_plan_id = $1
       ORDER BY ts.order_index, tt.order_index`,
      [plan.id],
    );

    res.json({ ...plan, tasks: tasksRes.rows });
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения плана" });
  }
};

// Обновить статус своей задачи
export const updateMyTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE User_Tasks SET status = $1, completed_at = CASE WHEN $1 = 'done' THEN NOW() ELSE NULL END 
       WHERE id = $2 AND user_plan_id IN (SELECT id FROM User_Plans WHERE user_id = $3)
       RETURNING *`,
      [status, taskId, req.user?.id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }

    // Начисление XP за выполнение задачи
    if (status === "done") {
      await pool.query(
        `UPDATE User_Plans SET total_xp = total_xp + 10 WHERE user_id = $1`,
        [req.user?.id],
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления задачи" });
  }
};
