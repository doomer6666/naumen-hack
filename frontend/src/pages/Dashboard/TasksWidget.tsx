/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Square,
  CheckSquare,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Send,
} from "lucide-react";
import apiClient from "../../api/client";

interface ApiTask {
  user_task_id: string;
  title: string;
  description: string;
  status: "pending" | "in_review" | "done";
  jira_issue_key?: string | null;
  mentor_comment?: string | null;
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
    } catch (err: any) {
      if (err.response?.status === 404)
        setError("План адаптации еще не назначен");
      else setError("Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToReview = async (task: ApiTask) => {
    if (updatingId) return;
    setUpdatingId(task.user_task_id);
    try {
      await apiClient.patch(`/plans/my/tasks/${task.user_task_id}`, {
        status: "in_review",
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.user_task_id === task.user_task_id
            ? { ...t, status: "in_review" }
            : t,
        ),
      );
    } catch {
      alert("Не удалось отправить задачу");
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
            const isUpdating = updatingId === task.user_task_id;
            return (
              <div
                key={task.user_task_id}
                className="task-item"
                style={{ opacity: task.status === "done" ? 0.6 : 1 }}
              >
                <div
                  className="task-checkbox"
                  style={{
                    borderColor:
                      task.status === "done"
                        ? "var(--success)"
                        : task.status === "in_review"
                          ? "var(--nau-orange)"
                          : undefined,
                    backgroundColor:
                      task.status === "done"
                        ? "var(--success)"
                        : task.status === "in_review"
                          ? "var(--nau-orange)"
                          : undefined,
                  }}
                >
                  {task.status === "done" ? (
                    <CheckSquare size={14} color="white" />
                  ) : task.status === "in_review" ? (
                    <Clock size={14} color="white" />
                  ) : (
                    <Square size={14} />
                  )}
                </div>
                <div className="task-info">
                  <h4
                    style={{
                      textDecoration:
                        task.status === "done" ? "line-through" : "none",
                    }}
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
                    {task.jira_issue_key && (
                      <a
                        href={`https://your-domain.atlassian.net/browse/${task.jira_issue_key}`}
                        target="_blank"
                        rel="noreferrer"
                        className="task-tag hr-jira-tag"
                        style={{ margin: 0, textDecoration: "none" }}
                      >
                        <ExternalLink size={10} /> {task.jira_issue_key}
                      </a>
                    )}
                    {task.mentor_comment && (
                      <span
                        className="text-sm"
                        style={{ color: "var(--danger)" }}
                      >
                        Комментарий: {task.mentor_comment}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  {task.status === "pending" && (
                    <button
                      className="mood-btn auto-width selected"
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        gap: "4px",
                      }}
                      onClick={() => handleSendToReview(task)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 size={12} className="spinner" />
                      ) : (
                        <Send size={12} />
                      )}{" "}
                      На проверку
                    </button>
                  )}
                  {task.status === "in_review" && (
                    <span className="task-tag orange-tag">
                      Ожидает проверки
                    </span>
                  )}
                  {task.status === "done" && (
                    <span
                      className="task-tag"
                      style={{ background: "var(--success)", color: "white" }}
                    >
                      Выполнено
                    </span>
                  )}
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
