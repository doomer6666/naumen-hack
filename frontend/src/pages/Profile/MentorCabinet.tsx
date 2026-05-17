import React, { useState, useEffect } from "react";
import {
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  MessageCircle,
  Loader2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import apiClient from "../../api/client";

interface Mentee {
  id: string;
  name: string;
  position: string;
  plan_status: string;
  total_tasks: string;
  done_tasks: string;
  latest_mood: number | null;
}

interface MentorTask {
  id: string;
  title: string;
  desc: string;
  isUrgent: boolean;
  done: boolean;
}

const INITIAL_TASKS_MOCK: MentorTask[] = [
  {
    id: "t1",
    title: "Проверить архитектурную схему",
    desc: "Виктор Козлов • До конца дня",
    isUrgent: true,
    done: false,
  },
  {
    id: "t2",
    title: "Назначить встречу-знакомство",
    desc: "Новый стажер • Завтра",
    isUrgent: false,
    done: false,
  },
];

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
  const [tasks, setTasks] = useState<MentorTask[]>(INITIAL_TASKS_MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/mentor/my-mentees");
        setMentees(res.data.mentees);
        setStats(res.data.stats);
      } catch (err) {
        console.error("Ошибка загрузки подопечных:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    );
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
                    style={{ marginLeft: "12px", minWidth: "220px" }}
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
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar-fill ${isLagging ? "warning" : ""}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray text-sm">
                        {progress}% ({done}/{total})
                      </span>
                    </div>
                  </div>

                  <div className="flex-col gap-12 align-end ml-auto">
                    <div className="flex-row gap-8 align-center">
                      {getMoodIcon(mentee.latest_mood)}
                      <span className="text-sm text-gray">
                        Пульс:{" "}
                        {mentee.latest_mood
                          ? `${mentee.latest_mood}/10`
                          : "Нет данных"}
                      </span>
                    </div>
                    <div className="flex-row gap-8">
                      <button
                        className="mood-btn auto-width selected flex-row align-center gap-8"
                        onClick={() => alert(`План развития: ${mentee.name}`)}
                      >
                        <Target size={16} /> <span>План развития</span>
                      </button>
                      <button
                        className="mood-btn icon-only"
                        onClick={() => alert(`Написать: ${mentee.name}`)}
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Задачи наставника</div>
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item align-center p-3 cursor-pointer ${task.isUrgent && !task.done ? "active" : ""}`}
              onClick={() => toggleTask(task.id)}
            >
              <div className={`task-checkbox ${task.done ? "checked" : ""}`} />
              <div
                className="task-info"
                style={{
                  opacity: task.done ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <h4
                  className={`mb-1 m-0 ${task.isUrgent && !task.done ? "text-orange" : "text-dark"}`}
                  style={{
                    textDecoration: task.done ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </h4>
                <p
                  className={`${task.isUrgent && !task.done ? "text-dark" : "text-gray"} m-0`}
                >
                  {task.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Мой вклад</div>
        <div className="badges-list align-center h-full gap-24">
          <div className="badge-item">
            <div className="badge-icon blue">
              <CheckCircle size={28} />
            </div>
            <div className="mt-2">
              <strong className="font-bold text-dark text-lg block">
                {stats.completed}
              </strong>
              <span className="badge-title">Выпущено</span>
            </div>
          </div>

          <div className="badge-item">
            <div className="badge-icon gold">
              <Clock size={28} />
            </div>
            <div className="mt-2">
              <strong className="font-bold text-dark text-lg block">—</strong>
              <span className="badge-title">Потрачено</span>
            </div>
          </div>

          <div className="badge-item">
            <div className="badge-icon locked">
              <BookOpen size={28} />
            </div>
            <div className="mt-2">
              <strong className="font-bold text-dark text-lg block">
                {stats.active}
              </strong>
              <span className="badge-title">Обучаются</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
