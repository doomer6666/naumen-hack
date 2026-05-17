/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Target,
  Heart,
  Rocket,
  Calendar,
  Lock,
  MessageSquare,
  Phone,
  CheckSquare,
  Circle,
  Loader2,
  AlertCircle,
  Award,
} from "lucide-react";
import apiClient from "../../api/client";
import MoodWidget from "../Dashboard/MoodWidget";

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  heart: Heart,
  rocket: Rocket,
  calendar: Calendar,
};

export const EmployeeCabinet: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [planRes, gamRes, dirRes] = await Promise.allSettled([
          apiClient.get("/plans/my"),
          apiClient.get("/gamification/my-progress"),
          apiClient.get("/directory/users"),
        ]);

        if (planRes.status === "fulfilled" && planRes.value.data) {
          const planData = planRes.value.data;
          setPlan(planData);

          if (planData.mentor_id && dirRes.status === "fulfilled") {
            const mentorData = dirRes.value.data.find(
              (u: any) => u.id === planData.mentor_id,
            );
            if (mentorData) {
              const parts = mentorData.name.split(" ");
              const initials =
                parts.length > 1
                  ? (parts[0][0] + parts[1][0]).toUpperCase()
                  : mentorData.name.substring(0, 2).toUpperCase();
              setMentor({ ...mentorData, initials, relation: "Наставник" });
            }
          }
        }

        if (gamRes.status === "fulfilled") {
          setGamification(gamRes.value.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки кабинета:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    if (currentStatus === "done") return;
    try {
      await apiClient.patch(`/plans/my/tasks/${taskId}`, { status: "done" });
      setPlan((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) =>
          t.user_task_id === taskId ? { ...t, status: "done" } : t,
        ),
      }));
      // Обновляем геймификацию, чтобы сразу увидеть новый бейдж, если он выдан
      const gamRes = await apiClient.get("/gamification/my-progress");
      if (gamRes.data) setGamification(gamRes.data);
    } catch (err) {
      console.error("Ошибка обновления задачи:", err);
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

  if (error) {
    return (
      <div
        className="widget"
        style={{ textAlign: "center", color: "var(--danger)" }}
      >
        <AlertCircle size={32} /> <p>{error}</p>
      </div>
    );
  }

  const totalTasks = plan?.tasks?.length || 0;
  const doneTasks =
    plan?.tasks?.filter((t: any) => t.status === "done").length || 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const currentLevel = gamification?.level || 1;
  const totalXp = gamification?.xp || 0;
  const badges = gamification?.badges || [];
  const earnedCount = badges.filter((b: any) => b.earned).length;

  return (
    <div className="dashboard-grid">
      <div className="widget col-span-1 row-span-2">
        <div className="widget-title">
          План развития
          <span className="task-tag orange-tag">
            Уровень {currentLevel} ({totalXp} XP)
          </span>
        </div>

        <div className="progress-wrapper justify-center flex-col gap-16 mb-4">
          <div
            className="progress-chart"
            style={{
              width: "130px",
              height: "130px",
              background: `conic-gradient(var(--nau-orange) ${progressPercent}%, var(--nau-light-gray) 0)`,
            }}
          >
            <div
              className="progress-inner"
              style={{ width: "100px", height: "100px" }}
            >
              <span className="percent" style={{ fontSize: "26px" }}>
                {progressPercent}%
              </span>
              <span className="label">Пройдено</span>
            </div>
          </div>
          <div className="flex-col align-center gap-4 text-center">
            <p className="text-gray text-sm m-0">Задач выполнено:</p>
            <strong className="font-bold text-dark">
              {doneTasks} из {totalTasks}
            </strong>
          </div>
        </div>

        <div className="task-list">
          {plan?.tasks?.length > 0 ? (
            plan.tasks.map((task: any) => (
              <div
                key={task.user_task_id}
                className={`task-item flex-col gap-12 ${task.status !== "done" ? "active" : ""}`}
              >
                <div className="task-info w-full">
                  <div className="flex-row align-center gap-8">
                    <div
                      className="task-checkbox"
                      onClick={() => toggleTask(task.user_task_id, task.status)}
                    >
                      {task.status === "done" ? (
                        <CheckSquare size={14} color="white" />
                      ) : (
                        <Circle size={14} />
                      )}
                    </div>
                    <h4
                      className={`m-0 ${task.status === "done" ? "text-gray" : "text-dark"}`}
                      style={{
                        textDecoration:
                          task.status === "done" ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </h4>
                  </div>
                  {task.description && (
                    <p
                      className="m-0 text-sm text-gray mt-2"
                      style={{ paddingLeft: "24px" }}
                    >
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray text-sm text-center">
              План еще не назначен
            </p>
          )}
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Команда поддержки</div>
        <div className="task-list">
          {mentor ? (
            <div className="task-item align-center">
              <div
                className="avatar"
                style={{ width: "48px", height: "48px", fontSize: "16px" }}
              >
                {mentor.initials}
              </div>
              <div className="task-info">
                <h4 style={{ fontSize: "15px", margin: "0 0 4px 0" }}>
                  {mentor.name}
                </h4>
                <p className="m-0 text-sm">
                  {mentor.position || "Разработчик"} •{" "}
                  <strong className="font-bold text-dark">
                    {mentor.relation}
                  </strong>
                </p>
              </div>
              <div className="flex-row gap-8">
                <button className="mood-btn icon-only">
                  <MessageSquare size={18} />
                </button>
                <button className="mood-btn icon-only">
                  <Phone size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-gray text-sm">
              <p>Наставник пока не назначен</p>
            </div>
          )}
        </div>
      </div>

      <MoodWidget />

      <div className="widget col-span-2">
        <div className="widget-title">
          Достижения
          <span className="widget-subtitle">
            Собрано: {earnedCount}/{badges.length}
          </span>
        </div>
        <div className="badges-list">
          {badges.map((badge: any) => {
            const IconComponent = iconMap[badge.icon_url] || Award;
            return (
              <div
                key={badge.id}
                className="badge-item"
                style={{ opacity: badge.earned ? 1 : 0.4 }}
              >
                <div
                  className={`badge-icon ${badge.earned ? "gold" : "locked"}`}
                >
                  {badge.earned ? (
                    <IconComponent size={28} />
                  ) : (
                    <Lock size={28} />
                  )}
                </div>
                <span
                  className={`badge-title mt-2 ${badge.earned ? "text-dark" : "text-gray"}`}
                >
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
