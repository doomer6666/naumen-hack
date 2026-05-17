import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Проверка роли
const isHR = (req: AuthRequest, res: Response): boolean => {
  if (req.user?.role !== "hr" && req.user?.role !== "admin") {
    res.status(403).json({ message: "Доступ запрещен" });
    return false;
  }
  return true;
};

// Аналитика
export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const inProgress = await pool.query(
      `SELECT COUNT(*) FROM User_Plans WHERE status = 'in_progress'`,
    );
    const completed = await pool.query(
      `SELECT COUNT(*) FROM User_Plans WHERE status = 'completed'`,
    );
    const avgMood = await pool.query(
      `SELECT AVG(mood_score) FROM Feedback_Responses WHERE submitted_at > NOW() - INTERVAL '7 days'`,
    );

    res.json({
      in_progress: parseInt(inProgress.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      avg_mood: parseFloat(avgMood.rows[0].avg || 0).toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка аналитики" });
  }
};

// Шаблоны (CRUD)
export const getTemplates = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const result = await pool.query(
      "SELECT * FROM Onboarding_Templates ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения шаблонов" });
  }
};

export const createTemplate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { name, description, duration_days } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Onboarding_Templates (name, description, duration_days, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, duration_days, req.user?.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка создания шаблона" });
  }
};

// Назначить план сотруднику
export const assignPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { id: userId } = req.params; // ID сотрудника
  const { template_id, mentor_id } = req.body;

  try {
    // 1. Создаем план
    const planRes = await pool.query(
      `INSERT INTO User_Plans (user_id, template_id, mentor_id, status) 
       VALUES ($1, $2, $3, 'in_progress') RETURNING id`,
      [userId, template_id, mentor_id || null],
    );
    const planId = planRes.rows[0].id;

    // 2. Копируем все задачи из шаблона в User_Tasks
    await pool.query(
      `INSERT INTO User_Tasks (user_plan_id, template_task_id, status)
       SELECT $1, tt.id, 'pending'
       FROM Template_Tasks tt
       JOIN Template_Stages ts ON tt.stage_id = ts.id
       WHERE ts.template_id = $2`,
      [planId, template_id],
    );

    res.status(201).json({ message: "План назначен", plan_id: planId });
  } catch (error) {
    res.status(500).json({ message: "Ошибка назначения плана" });
  }
};

// Выгрузка фидбеков
export const getFeedbacks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  try {
    const result = await pool.query(
      `SELECT fr.*, u.name as user_name FROM Feedback_Responses fr JOIN Users u ON fr.user_id = u.id ORDER BY fr.submitted_at DESC LIMIT 50`,
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка получения фидбеков" });
  }
};

// Ручное изменение статуса задачи HR-ом
export const hrUpdateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!isHR(req, res)) return;
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE User_Tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, taskId],
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления задачи HR-ом" });
  }
};
