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
        `INSERT INTO User_Badges (user_id, badge_id) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, badge_id) DO NOTHING
         RETURNING *`,
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

    if (status === "done") {
      await pool.query(
        `UPDATE User_Plans SET total_xp = total_xp + 10 WHERE user_id = $1`,
        [req.user?.id],
      );

      const stats = await pool.query(
        `SELECT 
           COUNT(*) FILTER (WHERE ut.status = 'done') as done_count,
           COUNT(*) as total_count
         FROM User_Tasks ut
         JOIN User_Plans up ON ut.user_plan_id = up.id
         WHERE up.user_id = $1`,
        [req.user?.id],
      );

      const doneCount = parseInt(stats.rows[0].done_count, 10);
      const totalCount = parseInt(stats.rows[0].total_count, 10);

      if (doneCount >= 1) {
        await awardBadge(req.user!.id, "task_count_1");
      }
      if (doneCount === totalCount && totalCount > 0) {
        await awardBadge(req.user!.id, "tasks_all_done");
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления задачи" });
  }
};
