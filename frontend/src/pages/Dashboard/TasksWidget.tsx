import React, { useState, useEffect } from "react";
import { Square, CheckSquare, Loader2, AlertCircle } from "lucide-react";
import apiClient from "../../api/client";

interface ApiTask {
  user_task_id: string;
  task_id: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "in_progress" | "done" | "blocked";
  order_index: number;
}

const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await apiClient.get("/plans/my");
      const sortedTasks = res.data.tasks.sort(
        (a: ApiTask, b: ApiTask) => a.order_index - b.order_index,
      );
      setTasks(sortedTasks);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("План адаптации еще не назначен HR-ом");
      } else {
        setError("Не удалось загрузить задачи");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: ApiTask) => {
    if (updatingId || task.status === "done") return;

    setUpdatingId(task.user_task_id);
    const newStatus = task.status === "pending" ? "done" : "done"; // Пока что только отмечаем выполненным

    try {
      await apiClient.patch(`/plans/my/tasks/${task.user_task_id}`, {
        status: newStatus,
      });

      // Обновляем локальный стейт
      setTasks((prev) =>
        prev.map((t) =>
          t.user_task_id === task.user_task_id
            ? { ...t, status: newStatus }
            : t,
        ),
      );
    } catch (error) {
      console.error("Ошибка обновления задачи:", error);
      alert("Не удалось обновить статус задачи");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="widget"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget">
        <div className="widget-title">Следующие шаги</div>
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "var(--nau-gray)",
          }}
        >
          <AlertCircle size={32} style={{ marginBottom: "8px" }} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-title">Следующие шаги</div>
      <div className="task-list">
        {tasks.length === 0 ? (
          <p style={{ color: "var(--nau-gray)", textAlign: "center" }}>
            Задач нет
          </p>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === "done";
            const isUpdating = updatingId === task.user_task_id;

            return (
              <div
                key={task.user_task_id}
                className={`task-item ${isDone ? "" : "today"}`}
                style={{ opacity: isDone ? 0.6 : 1 }}
              >
                <div
                  className="task-checkbox"
                  onClick={() => handleToggleTask(task)}
                  style={{
                    borderColor: isDone ? "var(--success)" : undefined,
                    backgroundColor: isDone ? "var(--success)" : undefined,
                    color: isDone ? "white" : "transparent",
                    cursor: isUpdating ? "wait" : "pointer",
                  }}
                >
                  {isUpdating ? (
                    <Loader2 size={16} className="spinner" />
                  ) : isDone ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </div>
                <div className="task-info">
                  <h4
                    style={{ textDecoration: isDone ? "line-through" : "none" }}
                  >
                    {task.title}
                  </h4>
                  <p>{task.description}</p>
                </div>
                <div className={`task-tag ${isDone ? "" : "today-tag"}`}>
                  {isDone
                    ? "Выполнено"
                    : task.type === "milestone"
                      ? "Веха"
                      : "В процессе"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TasksWidget;
