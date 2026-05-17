import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  ExternalLink,
  XCircle,
  Check,
  Users,
} from "lucide-react";
import apiClient from "../../api/client";
import "./MentorCabinet.css";

interface Mentee {
  id: string;
  name: string;
  position: string;
  plan_status: string;
  total_tasks: string;
  done_tasks: string;
  latest_mood: number | null;
}

interface ReviewTask {
  task_id: string;
  title: string;
  mentee_name: string;
  jira_issue_key: string | null;
}

const getMoodIcon = (score: number | null) => {
  if (!score) return <Meh size={16} className="text-gray" />;
  if (score >= 8)
    return <Smile size={16} style={{ color: "var(--success)" }} />;
  if (score >= 5)
    return <Meh size={16} style={{ color: "var(--nau-orange)" }} />;
  return <Frown size={16} style={{ color: "var(--danger)" }} />;
};

export const MentorCabinet: React.FC = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [stats, setStats] = useState({ active: 0, completed: 0 });

  const [reviewTasks, setReviewTasks] = useState<ReviewTask[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menteesRes, reviewsRes] = await Promise.allSettled([
          apiClient.get("/mentor/my-mentees"),
          apiClient.get("/mentor/reviews"),
        ]);

        if (menteesRes.status === "fulfilled") {
          setMentees(menteesRes.value.data.mentees);
          setStats(menteesRes.value.data.stats);
        }
        if (reviewsRes.status === "fulfilled") {
          setReviewTasks(reviewsRes.value.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки подопечных:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReview = async (taskId: string, status: "done" | "pending") => {
    if (processingId) return;
    setProcessingId(taskId);
    const comment = comments[taskId] || "";

    try {
      await apiClient.post(`/mentor/tasks/${taskId}/review`, {
        status,
        comment,
      });
      setReviewTasks((prev) => prev.filter((t) => t.task_id !== taskId));
      setComments((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } catch (err) {
      console.error("Ошибка ревью:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader2 size={40} className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <div className="widget col-span-2">
        <div className="widget-title">
          Мои подопечные
          <span className="widget-subtitle">Активных: {stats.active}</span>
        </div>
        <div className="task-list">
          {mentees.length === 0 ? (
            <div className="text-center p-4 text-gray text-sm">
              <AlertCircle size={32} style={{ margin: "0 auto 8px" }} />
              <p>У вас пока нет активных подопечных</p>
            </div>
          ) : (
            mentees.map((mentee) => {
              const total = parseInt(mentee.total_tasks, 10);
              const done = parseInt(mentee.done_tasks, 10);
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;
              const isLagging =
                mentee.latest_mood !== null && mentee.latest_mood < 5;
              const initials = mentee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={mentee.id}
                  className={`task-item align-center p-4 ${isLagging ? "warning" : ""}`}
                >
                  <div
                    className="avatar"
                    style={{ width: "48px", height: "48px", fontSize: "16px" }}
                  >
                    {initials}
                  </div>
                  <div
                    className="task-info flex-col justify-center"
                    style={{ marginLeft: "12px", flex: 1 }}
                  >
                    <h4
                      style={{ fontSize: "16px", margin: "0 0 4px 0" }}
                      className="text-dark"
                    >
                      {mentee.name}
                    </h4>
                    <p className="m-0 text-gray">
                      {mentee.position || "Сотрудник"}
                    </p>
                    <div className="flex-row align-center gap-12 mt-3">
                      <div className="progress-bar-container" style={{ flex: 1 }}>
                        <div
                          className={`progress-bar-fill ${isLagging ? "warning" : ""}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray text-sm" style={{ minWidth: "40px" }}>
                        {progress}%
                      </span>
                      <div className="flex-row gap-4 align-center" style={{ minWidth: "80px" }}>
                        {getMoodIcon(mentee.latest_mood)}
                        <span className="text-sm text-gray">
                          {mentee.latest_mood ? `${mentee.latest_mood}/10` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">
          Задачи на проверку
          <span className="widget-subtitle">{reviewTasks.length} ожидают</span>
        </div>
        <div className="task-list">
          {reviewTasks.length !== 0 ? (
            <div className="text-center p-4 text-gray text-sm">
              <CheckCircle
                size={32}
                style={{ margin: "0 auto 8px", color: "var(--success)" }}
              />
              <p>Все задачи проверены</p>
            </div>
          ) : (
            reviewTasks.map((task) => (
              <div
                key={task.task_id}
                className="task-item flex-col gap-12 p-3 active"
              >
                <div className="flex-row align-center gap-8 w-full">
                  <Clock
                    size={16}
                    style={{ color: "var(--nau-orange)", flexShrink: 0 }}
                  />
                  <h4 className="m-0 text-dark" style={{ fontSize: "14px" }}>
                    {task.title}
                  </h4>
                </div>
                <div
                  className="flex-row align-center gap-8 w-full"
                  style={{ paddingLeft: "24px" }}
                >
                  <span className="text-sm text-gray">{task.mentee_name}</span>
                  {task.jira_issue_key && (
                    <a
                      href={`https://naumen.atlassian.net/browse/${task.jira_issue_key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="task-tag hr-jira-tag"
                      style={{ margin: 0, textDecoration: "none" }}
                    >
                      <ExternalLink size={10} /> {task.jira_issue_key}
                    </a>
                  )}
                </div>

                <div
                  className="flex-col gap-8 w-full"
                  style={{ paddingLeft: "24px" }}
                >
                  <input
                    type="text"
                    placeholder="Комментарий (для доработки)"
                    value={comments[task.task_id] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [task.task_id]: e.target.value,
                      }))
                    }
                    className="hr-input"
                    style={{ fontSize: "13px", padding: "6px 8px" }}
                  />
                  <div className="flex-row gap-8">
                    <button
                      className="mood-btn auto-width selected"
                      style={{
                        padding: "6px 10px",
                        fontSize: "12px",
                        gap: "4px",
                        background: "var(--success)",
                        borderColor: "var(--success)",
                      }}
                      onClick={() => handleReview(task.task_id, "done")}
                      disabled={processingId === task.task_id}
                    >
                      {processingId === task.task_id ? (
                        <Loader2 size={12} className="spinner" />
                      ) : (
                        <Check size={12} />
                      )}{" "}
                      Принять
                    </button>
                    <button
                      className="mood-btn auto-width"
                      style={{
                        padding: "6px 10px",
                        fontSize: "12px",
                        gap: "4px",
                        color: "var(--danger)",
                        borderColor: "var(--danger)",
                      }}
                      onClick={() => handleReview(task.task_id, "pending")}
                      disabled={processingId === task.task_id}
                    >
                      {processingId === task.task_id ? (
                        <Loader2 size={12} className="spinner" />
                      ) : (
                        <XCircle size={12} />
                      )}{" "}
                      Вернуть
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Блок Мой вклад */}
      <div className="widget">
        <div className="widget-title">
          Мой вклад
          <span className="widget-subtitle">Результаты вашей работы наставником</span>
        </div>
        <div className="contrib-cards">
          <div className="contrib-card">
            <div className="badge-icon blue">
              <CheckCircle size={22} />
            </div>
            <div className="contrib-info">
              <div className="contrib-top">
                <span className="contrib-value">{stats.completed}</span>
                <span className="contrib-label">Выпущено</span>
              </div>
              <p className="contr-desc">Сотрудников завершили адаптацию с вашей помощью</p>
            </div>
          </div>

          <div className="contrib-card">
            <div className="badge-icon green">
              <BookOpen size={22} />
            </div>
            <div className="contrib-info">
              <div className="contrib-top">
                <span className="contrib-value">{stats.active}</span>
                <span className="contrib-label">В процессе</span>
              </div>
              <p className="contr-desc">Сейчас находятся на вашем попечении</p>
            </div>
          </div>

          <div className="contrib-card">
            <div className="badge-icon gold">
              <Users size={22} />
            </div>
            <div className="contrib-info">
              <div className="contrib-top">
                <span className="contrib-value">{stats.completed + stats.active}</span>
                <span className="contrib-label">Всего</span>
              </div>
              <p className="contr-desc">Прошли через ваше наставничество</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};