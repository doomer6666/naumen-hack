/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  Pencil, // Добавлен импорт карандаша
} from "lucide-react";
import apiClient from "../../api/client";
import "./HrEmployeePlan.css";

interface Task {
  user_task_id: string;
  title: string;
  deadline: string;
  isCompleted: boolean;
  jira_issue_key?: string | null;
}

interface Stage {
  id: string;
  title: string;
  isOpen: boolean;
  tasks: Task[];
}

const HrEmployeePlan: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Сотрудник");
  const [mentorName, setMentorName] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [status, setStatus] = useState("");
  const [stages, setStages] = useState<Stage[]>([]);
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [isEditingMentor, setIsEditingMentor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await apiClient.get("/hr/employees");
        const emp = empRes.data.find((e: any) => e.id === userId);
        if (emp) setUserName(emp.name);

        const planRes = await apiClient.get(`/hr/employees/${userId}/plan`);
        const planData = planRes.data;

        setMentorName(planData.mentor_name || "Не назначен");
        setMentorId(planData.mentor_id || "");
        setStatus(
          planData.status === "in_progress" ? "В процессе" : planData.status,
        );
        setStages(planData.stages || []);

        const dirRes = await apiClient.get("/directory/users");
        setMentorsList(dirRes.data.filter((u: any) => u.role !== "newbie"));
      } catch (error: any) {
        if (error.response?.status === 404) {
          setStatus("Нет плана");
        } else {
          console.error("Ошибка загрузки плана:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const toggleStage = (stageId: string) => {
    setStages(
      stages.map((s) => (s.id === stageId ? { ...s, isOpen: !s.isOpen } : s)),
    );
  };

  const toggleTask = async (
    stageId: string,
    taskId: string,
    currentState: boolean,
  ) => {
    const newStatus = currentState ? "pending" : "done";
    try {
      await apiClient.patch(`/hr/users/${userId}/plan/tasks/${taskId}`, {
        status: newStatus,
      });
      setStages(
        stages.map((s) =>
          s.id === stageId
            ? {
                ...s,
                tasks: s.tasks.map((t) =>
                  t.user_task_id === taskId
                    ? { ...t, isCompleted: !currentState }
                    : t,
                ),
              }
            : s,
        ),
      );
    } catch (error) {
      console.error("Ошибка обновления задачи:", error);
      alert("Ошибка обновления задачи");
    }
  };

  const handleSaveMentor = async () => {
    try {
      await apiClient.patch(`/hr/employees/${userId}/plan`, {
        mentor_id: mentorId,
      });
      const mentor = mentorsList.find((m: any) => m.id === mentorId);
      setMentorName(mentor ? mentor.name : "Не назначен");
      setIsEditingMentor(false);
    } catch (error) {
      console.error("Ошибка сохранения наставника:", error);
      alert("Ошибка сохранения наставника");
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
    <div className="hr-emp-plan">
      <div className="hr-editor-header">
        <button
          className="hr-icon-btn-lg"
          onClick={() => navigate("/hr/employees")}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="hr-emp-plan-title">
          <h1 className="page-title">План: {userName}</h1>
          <span
            className={`task-tag ${status === "В процессе" ? "status-adapting" : "status-delayed"}`}
            style={{ alignSelf: "center" }}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="widget hr-emp-mentor-card">
        <div className="hr-emp-mentor-label">Наставник</div>
        <div className="hr-emp-mentor-select">
          <User size={20} color="var(--nau-orange)" />
          {isEditingMentor ? (
            <>
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="hr-input"
                style={{ flex: 1, padding: "8px" }}
              >
                <option value="">Не назначен</option>
                {mentorsList.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                className="hr-btn-primary"
                style={{ padding: "8px 12px" }}
                onClick={handleSaveMentor}
              >
                <Save size={16} />
              </button>
              <button
                className="hr-icon-btn"
                onClick={() => setIsEditingMentor(false)}
              >
                <XIcon size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="font-semibold text-dark">{mentorName}</span>
              <button
                className="hr-icon-btn"
                onClick={() => setIsEditingMentor(true)}
              >
                <Pencil size={16} /> {/* Заменено на карандаш */}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="hr-editor-stages">
        {stages.length === 0 ? (
          <div className="widget text-center text-gray p-4">
            Задачи не найдены
          </div>
        ) : (
          stages.map((stage) => (
            <div key={stage.id} className="hr-stage-card">
              <div
                className="hr-stage-header"
                onClick={() => toggleStage(stage.id)}
              >
                <div className="hr-stage-drag">
                  <GripVertical size={20} color="var(--nau-gray)" />
                </div>
                <div className="hr-stage-info">
                  <h3>{stage.title}</h3>
                  <span className="widget-subtitle">
                    {stage.tasks.filter((t) => t.isCompleted).length} /{" "}
                    {stage.tasks.length} выполнено
                  </span>
                </div>
                <div className="hr-stage-actions">
                  {stage.isOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {stage.isOpen && (
                <div className="hr-stage-content">
                  {stage.tasks.map((task) => (
                    <div
                      key={task.user_task_id}
                      className={`hr-task-card ${task.isCompleted ? "completed" : ""}`}
                    >
                      <div className="hr-task-drag">
                        <GripVertical size={16} color="var(--nau-gray)" />
                      </div>
                      <button
                        className="hr-checkbox"
                        onClick={() =>
                          toggleTask(
                            stage.id,
                            task.user_task_id,
                            task.isCompleted,
                          )
                        }
                      >
                        {task.isCompleted && <CheckIcon />}
                      </button>
                      <div className="hr-task-content">
                        <span className="hr-task-title">{task.title}</span>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            marginTop: "4px",
                          }}
                        >
                          <span className="task-tag today-tag">
                            <Calendar
                              size={12}
                              style={{ marginRight: "4px" }}
                            />
                            {task.deadline}
                          </span>
                          {task.jira_issue_key && (
                            <a
                              href={`https://naumen.atlassian.net/browse/${task.jira_issue_key}`}
                              target="_blank"
                              rel="noreferrer"
                              className="task-tag hr-jira-tag"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={12} /> {task.jira_issue_key}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CheckIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--nau-white)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default HrEmployeePlan;