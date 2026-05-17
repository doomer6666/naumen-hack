import React, { useState, useEffect } from "react";
import {
  Square,
  CheckSquare,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import apiClient from "../../api/client";

interface ApiTask {
  user_task_id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "done";
  jira_issue_key?: string | null;
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
      setTasks(res.data.tasks);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 404)
        setError("План адаптации еще не назначен HR-ом");
      else setError("Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: ApiTask) => {
    if (updatingId || task.status === "done") return;
    setUpdatingId(task.user_task_id);

    try {
      await apiClient.patch(`/plans/my/tasks/${task.user_task_id}`, {
        status: "done",
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.user_task_id === task.user_task_id ? { ...t, status: "done" } : t,
        ),
      );
    } catch {
      alert("Не удалось обновить статус задачи");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <div
        className="widget"
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader2 size={32} className="spinner" />
      </div>
    );
  if (error)
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
                    cursor: isUpdating ? "wait" : "pointer",
                  }}
                >
                  {isUpdating ? (
                    <Loader2 size={14} className="spinner" />
                  ) : isDone ? (
                    <CheckSquare size={14} color="white" />
                  ) : (
                    <Square size={14} />
                  )}
                </div>
                <div className="task-info">
                  <h4
                    style={{ textDecoration: isDone ? "line-through" : "none" }}
                  >
                    {task.title}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginTop: "4px",
                    }}
                  >
                    {task.description && (
                      <span className="text-gray text-sm">
                        {task.description}
                      </span>
                    )}
                    {task.jira_issue_key && (
                      <a
                        href={`https://${process.env.REACT_APP_JIRA_DOMAIN || "your-domain.atlassian.net"}/browse/${task.jira_issue_key}`}
                        target="_blank"
                        rel="noreferrer"
                        className="task-tag hr-jira-tag"
                        style={{ margin: 0, textDecoration: "none" }}
                      >
                        <ExternalLink size={10} /> {task.jira_issue_key}
                      </a>
                    )}
                  </div>
                </div>
                {isUpdating && task.jira_issue_key && (
                  <span className="text-sm text-gray">
                    Отправляем в Jira...
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TasksWidget;
