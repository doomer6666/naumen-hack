import React, { useState } from "react";
import {
  Calendar,
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  MessageCircle,
} from "lucide-react";

interface Mentee {
  id: string;
  name: string;
  role: string;
  initials: string;
  progress: number;
  status: "normal" | "lagging";
  nextMeeting: string;
  pendingTasks: number;
}

interface MentorTask {
  id: string;
  title: string;
  desc: string;
  isUrgent: boolean;
  done: boolean;
}

const MENTEES_MOCK: Mentee[] = [
  {
    id: "1",
    name: "Виктор Козлов",
    role: "Младший разработчик",
    initials: "ВК",
    progress: 45,
    status: "normal",
    nextMeeting: "Завтра, 11:00",
    pendingTasks: 2,
  },
  {
    id: "2",
    name: "Алина Борисова",
    role: "Системный аналитик",
    initials: "АБ",
    progress: 80,
    status: "lagging",
    nextMeeting: "Пт, 14:30",
    pendingTasks: 0,
  },
];

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

const MENTOR_STATS = {
  active: 2,
  completed: 8,
  totalHours: 42,
};

export const MentorCabinet: React.FC = () => {
  const [tasks, setTasks] = useState<MentorTask[]>(INITIAL_TASKS_MOCK);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    );
  };

  return (
    <div className="dashboard-grid">
      <div className="widget col-span-2">
        <div className="widget-title">
          Мои подопечные
          <button
            className="mood-btn auto-width"
            onClick={() => alert("Переход ко всем подопечным")}
          >
            Смотреть всех
          </button>
        </div>
        <div className="task-list">
          {MENTEES_MOCK.map((mentee) => {
            const isLagging = mentee.status === "lagging";
            return (
              <div
                key={mentee.id}
                className={`task-item align-center p-4 ${isLagging ? "warning" : ""}`}
              >
                <div
                  className="avatar"
                  style={{ width: "48px", height: "48px", fontSize: "16px" }}
                >
                  {mentee.initials}
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
                  <p className="m-0 text-gray">{mentee.role}</p>
                  <div className="flex-row align-center gap-12 mt-3">
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar-fill ${isLagging ? "warning" : ""}`}
                        style={{ width: `${mentee.progress}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray text-sm">
                      {mentee.progress}%
                    </span>
                  </div>
                </div>

                <div className="flex-col gap-12 align-end ml-auto">
                  <div className="flex-row gap-8">
                    <span className="task-tag orange-tag flex-row align-center gap-4">
                      <Calendar size={14} /> Встреча: {mentee.nextMeeting}
                    </span>
                    {mentee.pendingTasks > 0 && (
                      <span className="task-tag orange-tag">
                        Ждет проверки: {mentee.pendingTasks}
                      </span>
                    )}
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
          })}
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
                {MENTOR_STATS.completed}
              </strong>
              <span className="badge-title">Выпущено</span>
            </div>
          </div>

          <div className="badge-item">
            <div className="badge-icon gold">
              <Clock size={28} />
            </div>
            <div className="mt-2">
              <strong className="font-bold text-dark text-lg block">
                {MENTOR_STATS.totalHours}ч
              </strong>
              <span className="badge-title">Потрачено</span>
            </div>
          </div>

          <div className="badge-item">
            <div className="badge-icon locked">
              <BookOpen size={28} />
            </div>
            <div className="mt-2">
              <strong className="font-bold text-dark text-lg block">
                {MENTOR_STATS.active}
              </strong>
              <span className="badge-title">Обучаются</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
