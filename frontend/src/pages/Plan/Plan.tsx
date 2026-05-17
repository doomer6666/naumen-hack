/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Lock,
  Award,
  Target,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Send,
  ExternalLink,
  Loader2,
  XCircle,
  Check,
  AlertCircle,
} from "lucide-react";
import "./Plan.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/client";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_review" | "done";
  jira_issue_key?: string | null;
  mentor_comment?: string | null;
}

interface Milestone {
  title: string;
  description: string;
}

type StageStatus = "completed" | "in-progress" | "upcoming";

interface PlanStage {
  id: string;
  title: string;
  duration: string;
  status: StageStatus;
  tasks: Task[];
  milestone: Milestone;
}

export const PlanPage: React.FC = () => {
  const { role, userName } = useAuth();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams<{ userId?: string }>();

  const isEditable = role === "mentor" || role === "hr";
  const targetUserId = isEditable && paramUserId ? paramUserId : undefined;

  const [stages, setStages] = useState<PlanStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingUserName, setViewingUserName] = useState<string>("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        let res;
        if (targetUserId) {
          res = await apiClient.get(`/hr/employees/${targetUserId}/plan`);
          setViewingUserName(res.data.user_name || "Сотрудник");
        } else {
          res = await apiClient.get("/plans/my");
          setViewingUserName(userName || "Мой план");
        }

        const apiTasks = res.data.tasks || [];
        const stageMap = new Map<string, PlanStage>();

        apiTasks.forEach((t: any) => {
          if (!stageMap.has(t.stage_title)) {
            stageMap.set(t.stage_title, {
              id: t.stage_title,
              title: t.stage_title,
              duration: "",
              status: "upcoming",
              tasks: [],
              milestone: {
                title: "Контрольная точка",
                description: "Этап пройден",
              },
            });
          }
          stageMap.get(t.stage_title)!.tasks.push({
            id: t.user_task_id,
            title: t.title,
            description: t.description,
            status: t.status,
            jira_issue_key: t.jira_issue_key,
            mentor_comment: t.mentor_comment,
          });
        });

        const mappedStages = Array.from(stageMap.values());
        let foundActive = false;
        for (let i = 0; i < mappedStages.length; i++) {
          const s = mappedStages[i];
          const allDone =
            s.tasks.length > 0 && s.tasks.every((t) => t.status === "done");
          const hasActive = s.tasks.some(
            (t) => t.status === "pending" || t.status === "in_review",
          );

          if (allDone) {
            s.status = "completed";
          } else if (hasActive || (i === 0 && !foundActive)) {
            s.status = "in-progress";
            foundActive = true;
          } else {
            s.status = "upcoming";
          }
        }

        setStages(mappedStages);
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.warn("План не найден");
        } else {
          console.error("Ошибка загрузки плана:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [targetUserId, userName]);

  const handleSendToReview = async (taskId: string) => {
    if (processingId) return;
    setProcessingId(taskId);
    try {
      await apiClient.patch(`/plans/my/tasks/${taskId}`, {
        status: "in_review",
      });
      setStages((prev) =>
        prev.map((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: "in_review", mentor_comment: null }
              : t,
          ),
        })),
      );
    } catch {
      alert("Ошибка отправки на проверку");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReview = async (taskId: string, status: "done" | "pending") => {
    if (processingId) return;
    setProcessingId(taskId);
    const comment = comments[taskId] || "";
    try {
      await apiClient.post(`/mentor/tasks/${taskId}/review`, {
        status,
        comment,
      });
      setStages((prev) =>
        prev.map((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: status,
                  mentor_comment: status === "pending" ? comment : null,
                }
              : t,
          ),
        })),
      );
      setComments((prev) => {
        const n = { ...prev };
        delete n[taskId];
        return n;
      });
    } catch {
      alert("Ошибка обновления статуса");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleStageCollapse = (stageId: string) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) newSet.delete(stageId);
      else newSet.add(stageId);
      return newSet;
    });
  };

  const getStatusDot = (status: string) => {
    if (status === "done") return "var(--success)";
    if (status === "in_review") return "var(--nau-orange)";
    return "var(--nau-border)";
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
      >
        <Loader2 size={48} className="spinner" />
      </div>
    );
  }

  return (
    <div className="plan-container">
      {!isEditable ? (
        <div className="plan-header">
          <h1 className="page-title">План адаптации</h1>
          <p className="page-subtitle">
            Отслеживайте свой прогресс и открывайте новые этапы
          </p>
        </div>
      ) : (
        <div className="hr-editor-header">
          <button className="hr-icon-btn-lg" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="hr-emp-plan-title">
            <h1 className="page-title">{viewingUserName}</h1>
          </div>
        </div>
      )}

      <div className="timeline">
        {stages.length === 0 ? (
          <div className="text-center p-4 text-gray">
            <AlertCircle size={32} />
            <p>План еще не назначен</p>
          </div>
        ) : (
          stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isExpanded = expandedStages.has(stage.id);
            const showContent = !isCompleted || isExpanded;

            return (
              <div key={stage.id} className={`timeline-stage ${stage.status}`}>
                <div className="stage-node"></div>
                <div
                  className={`stage-header ${isCompleted ? "collapsible" : ""}`}
                  onClick={() => isCompleted && toggleStageCollapse(stage.id)}
                >
                  <div className="stage-title-wrap">
                    <span className="stage-status">
                      {stage.status === "completed"
                        ? "Выполнено"
                        : stage.status === "in-progress"
                          ? "В процессе"
                          : "Впереди"}
                    </span>
                    <h3>{stage.title}</h3>
                  </div>
                  {isCompleted && (
                    <div className="collapse-icon">
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  )}
                </div>

                {showContent && (
                  <div className="stage-content">
                    <div className="widget task-widget">
                      <div className="task-list">
                        {stage.tasks.map((task) => {
                          const isDone = task.status === "done";
                          const isReview = task.status === "in_review";

                          return (
                            <div
                              key={task.id}
                              className="task-item flex-col gap-8"
                              style={{ opacity: isDone ? 0.6 : 1 }}
                            >
                              <div className="flex-row align-center gap-12 w-full">
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: getStatusDot(task.status),
                                    flexShrink: 0,
                                  }}
                                ></div>
                                <h4
                                  className="m-0"
                                  style={{
                                    textDecoration: isDone
                                      ? "line-through"
                                      : "none",
                                    color: isDone
                                      ? "var(--nau-gray)"
                                      : "var(--nau-dark)",
                                  }}
                                >
                                  {task.title}
                                </h4>
                                {task.jira_issue_key && (
                                  <a
                                    href={`https://your-domain.atlassian.net/browse/${task.jira_issue_key}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="task-tag hr-jira-tag"
                                    style={{
                                      margin: 0,
                                      textDecoration: "none",
                                    }}
                                  >
                                    <ExternalLink size={10} />{" "}
                                    {task.jira_issue_key}
                                  </a>
                                )}
                              </div>

                              {task.description && !isDone && (
                                <p
                                  className="m-0 text-sm text-gray"
                                  style={{ paddingLeft: "22px" }}
                                >
                                  {task.description}
                                </p>
                              )}

                              {task.mentor_comment && !isDone && (
                                <div style={{ paddingLeft: "22px" }}>
                                  <span
                                    className="text-sm"
                                    style={{
                                      color: "var(--danger)",
                                      background: "#fde8e8",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    Комментарий: {task.mentor_comment}
                                  </span>
                                </div>
                              )}

                              <div
                                className="flex-row gap-8 align-center"
                                style={{
                                  paddingLeft: "22px",
                                  marginTop: "4px",
                                }}
                              >
                                {/* --- СОТРУДНИК --- */}
                                {!isEditable && !isDone && !isReview && (
                                  <button
                                    className="mood-btn auto-width selected"
                                    style={{
                                      padding: "4px 10px",
                                      fontSize: "12px",
                                      gap: "4px",
                                    }}
                                    onClick={() => handleSendToReview(task.id)}
                                    disabled={processingId === task.id}
                                  >
                                    {processingId === task.id ? (
                                      <Loader2 size={12} className="spinner" />
                                    ) : (
                                      <Send size={12} />
                                    )}{" "}
                                    На проверку
                                  </button>
                                )}
                                {!isEditable && isReview && (
                                  <span className="task-tag orange-tag">
                                    Ожидает проверки наставником
                                  </span>
                                )}

                                {/* --- МЕНТОР / HR --- */}
                                {isEditable && !isDone && !isReview && (
                                  <span
                                    className="text-sm text-gray"
                                    style={{ opacity: 0.7 }}
                                  >
                                    Ожидает отправки сотрудником
                                  </span>
                                )}
                                {isEditable && isReview && (
                                  <>
                                    <input
                                      type="text"
                                      placeholder="Комментарий (для доработки)"
                                      value={comments[task.id] || ""}
                                      onChange={(e) =>
                                        setComments((p) => ({
                                          ...p,
                                          [task.id]: e.target.value,
                                        }))
                                      }
                                      className="hr-input"
                                      style={{
                                        fontSize: "13px",
                                        padding: "6px 8px",
                                        flex: 1,
                                      }}
                                    />
                                    <button
                                      className="mood-btn auto-width selected"
                                      style={{
                                        padding: "6px 10px",
                                        fontSize: "12px",
                                        gap: "4px",
                                        background: "var(--success)",
                                        borderColor: "var(--success)",
                                        color: "white",
                                      }}
                                      onClick={() =>
                                        handleReview(task.id, "done")
                                      }
                                      disabled={processingId === task.id}
                                    >
                                      {processingId === task.id ? (
                                        <Loader2
                                          size={12}
                                          className="spinner"
                                        />
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
                                      onClick={() =>
                                        handleReview(task.id, "pending")
                                      }
                                      disabled={processingId === task.id}
                                    >
                                      {processingId === task.id ? (
                                        <Loader2
                                          size={12}
                                          className="spinner"
                                        />
                                      ) : (
                                        <XCircle size={12} />
                                      )}{" "}
                                      Вернуть
                                    </button>
                                  </>
                                )}

                                {/* --- ВЫПОЛНЕНО --- */}
                                {isDone && (
                                  <span
                                    className="task-tag"
                                    style={{
                                      background: "var(--success)",
                                      color: "white",
                                    }}
                                  >
                                    Выполнено
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="milestone-block">
                      <div
                        className={`badge-icon ${stage.status === "completed" ? "gold" : stage.status === "in-progress" ? "blue" : "locked"}`}
                        style={{ width: 48, height: 48 }}
                      >
                        {stage.status === "upcoming" ? (
                          <Lock size={20} />
                        ) : stage.status === "completed" ? (
                          <Award size={24} />
                        ) : (
                          <Target size={24} />
                        )}
                      </div>
                      <div className="milestone-info">
                        <h4>{stage.milestone.title}</h4>
                        <p>{stage.milestone.description}</p>
                      </div>
                      {stage.status === "upcoming" && (
                        <div
                          className="task-tag"
                          style={{
                            background: "var(--nau-border)",
                            color: "var(--nau-gray)",
                          }}
                        >
                          Заблокировано
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
