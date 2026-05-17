import React, { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { Loader2 } from "lucide-react";

const ProgressWidget: React.FC = () => {
  const [percent, setPercent] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamificationRes, planRes] = await Promise.allSettled([
          apiClient.get("/gamification/my-progress"),
          apiClient.get("/plans/my"),
        ]);

        if (gamificationRes.status === "fulfilled") {
          setLevel(gamificationRes.value.data.level || 1);
          setXp(gamificationRes.value.data.xp || 0);
        }

        if (planRes.status === "fulfilled" && planRes.value.data.tasks) {
          const tasks = planRes.value.data.tasks;
          const done = tasks.filter((t: any) => t.status === "done").length;
          const total = tasks.length;
          setTasksCompleted(done);
          setTotalTasks(total);
          setPercent(total > 0 ? Math.round((done / total) * 100) : 0);
        }
      } catch (error) {
        console.error("Ошибка загрузки прогресса:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="widget">
      <div className="widget-title">
        Прогресс адаптации
        <span className="widget-subtitle">
          Уровень {level} • {xp} XP
        </span>
      </div>
      <div className="progress-wrapper">
        <div
          className="progress-chart"
          style={{
            background: `conic-gradient(var(--nau-orange) ${percent}%, var(--nau-light-gray) 0)`,
          }}
        >
          <div className="progress-inner">
            <span className="percent">{percent}%</span>
            <span className="label">Пройдено</span>
          </div>
        </div>
        <div className="progress-stats">
          <p>
            Выполнено задач:{" "}
            <strong>
              {tasksCompleted} из {totalTasks}
            </strong>
          </p>
          <p>
            Накоплено XP: <strong>{xp}</strong>
          </p>
          <p>
            Текущий уровень: <strong>{level}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;
