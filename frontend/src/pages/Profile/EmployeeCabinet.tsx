import React, { useState } from "react";
import {
  Target,
  BookOpen,
  Lock,
  MessageSquare,
  Phone,
  Smile,
  Meh,
  Frown,
  CheckSquare,
  Circle,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  role: string;
  relation: string;
  initials: string;
}

interface Milestone {
  id: string;
  title: string;
  status: "completed" | "current" | "locked";
  tasks: { name: string; done: boolean }[];
}

interface Achievement {
  id: string;
  title: string;
  type: "gold" | "blue" | "locked";
  icon: "target" | "book" | "lock";
}

const CONTACTS_MOCK: Contact[] = [
  {
    id: "1",
    name: "Алексей Иванов",
    role: "Старший разработчик",
    relation: "Наставник",
    initials: "АИ",
  },
  {
    id: "2",
    name: "Мария Смирнова",
    role: "Специалист по кадрам",
    relation: "Отдел кадров",
    initials: "МС",
  },
];

const INITIAL_PLAN_MOCK = {
  level: 2,
  points: 350,
  progress: 45,
  currentStage: "Месяц 1: Погружение",
  milestones: [
    {
      id: "m1",
      title: "Неделя 1: Добро пожаловать",
      status: "completed",
      tasks: [
        { name: "Оформление доступов", done: true },
        { name: "Вводная встреча", done: true },
      ],
    },
    {
      id: "m2",
      title: "Месяц 1: Первые задачи",
      status: "current",
      tasks: [
        { name: "Изучить архитектуру", done: true },
        { name: "Выполнить первую задачу", done: false },
      ],
    },
    {
      id: "m3",
      title: "Месяц 3: Итоги",
      status: "locked",
      tasks: [{ name: "Итоговая аттестация", done: false }],
    },
  ] as Milestone[],
};

const ACHIEVEMENTS_MOCK: Achievement[] = [
  { id: "a1", title: "Первая задача", type: "gold", icon: "target" },
  { id: "a2", title: "Мастер доступов", type: "blue", icon: "book" },
  { id: "a3", title: "Неделя в компании", type: "locked", icon: "lock" },
];

export const EmployeeCabinet: React.FC = () => {
  // Локальные стейты для имитации интерактивности
  const [plan, setPlan] = useState(INITIAL_PLAN_MOCK);
  const [activeMood, setActiveMood] = useState<
    "good" | "normal" | "bad" | null
  >("good");
  const [hasAccess, setHasAccess] = useState(true);

  // Обработчик клика по задаче
  const toggleTask = (milestoneId: string, taskIndex: number) => {
    setPlan((prev) => ({
      ...prev,
      milestones: prev.milestones.map((ms) => {
        if (ms.id === milestoneId) {
          const updatedTasks = [...ms.tasks];
          updatedTasks[taskIndex].done = !updatedTasks[taskIndex].done;
          return { ...ms, tasks: updatedTasks };
        }
        return ms;
      }),
    }));
  };

  return (
    <div className="dashboard-grid">
      <div className="widget col-span-1 row-span-2">
        <div className="widget-title">
          План развития
          <span className="task-tag orange-tag">
            Уровень {plan.level} ({plan.points} баллов)
          </span>
        </div>

        <div className="progress-wrapper justify-center flex-col gap-16 mb-4">
          <div
            className="progress-chart"
            style={{
              width: "130px",
              height: "130px",
              background: `conic-gradient(var(--nau-orange) ${plan.progress}%, var(--nau-light-gray) 0)`,
            }}
          >
            <div
              className="progress-inner"
              style={{ width: "100px", height: "100px" }}
            >
              <span className="percent" style={{ fontSize: "26px" }}>
                {plan.progress}%
              </span>
              <span className="label">Пройдено</span>
            </div>
          </div>
          <div className="flex-col align-center gap-4 text-center">
            <p className="text-gray text-sm m-0">Текущий этап:</p>
            <strong className="font-bold text-dark">{plan.currentStage}</strong>
          </div>
        </div>

        <div className="task-list">
          {plan.milestones.map((ms) => {
            const isCurrent = ms.status === "current";
            const isLocked = ms.status === "locked";
            const itemClass = `task-item flex-col gap-12 ${isCurrent ? "active" : ""} ${isLocked ? "locked" : ""}`;

            return (
              <div key={ms.id} className={itemClass}>
                <div className="task-info w-full">
                  <div className="flex-row justify-between align-center">
                    <h4
                      className={`flex-row align-center gap-8 m-0 ${isCurrent ? "text-orange" : "text-dark"}`}
                    >
                      {isLocked ? (
                        <Lock size={18} />
                      ) : ms.status === "completed" ? (
                        <CheckSquare size={18} className="text-success" />
                      ) : (
                        <Circle size={18} />
                      )}
                      {ms.title}
                    </h4>
                  </div>
                  {!isLocked && (
                    <div className="flex-col gap-8 mt-3">
                      {ms.tasks.map((task, idx) => (
                        <div
                          key={idx}
                          className="flex-row align-center gap-8 text-gray cursor-pointer"
                          onClick={() => toggleTask(ms.id, idx)}
                        >
                          <div
                            className={`task-checkbox ${task.done ? "checked" : ""}`}
                          />
                          <span
                            style={{
                              textDecoration: task.done
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Команда поддержки</div>
        <div className="task-list">
          {CONTACTS_MOCK.map((contact) => (
            <div key={contact.id} className="task-item align-center">
              <div
                className="avatar"
                style={{ width: "48px", height: "48px", fontSize: "16px" }}
              >
                {contact.initials}
              </div>
              <div className="task-info">
                <h4 style={{ fontSize: "15px", margin: "0 0 4px 0" }}>
                  {contact.name}
                </h4>
                <p className="m-0 text-sm">
                  {contact.role} •{" "}
                  <strong className="font-bold text-dark">
                    {contact.relation}
                  </strong>
                </p>
              </div>
              <div className="flex-row gap-8">
                <button
                  className="mood-btn icon-only"
                  onClick={() => alert(`Открыть чат с ${contact.name}`)}
                >
                  <MessageSquare size={18} />
                </button>
                <button
                  className="mood-btn icon-only"
                  onClick={() => alert(`Позвонить ${contact.name}`)}
                >
                  <Phone size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Оценка настроения</div>
        <div className="flex-col justify-between h-full gap-16">
          <p className="text-dark m-0">
            Как прошла ваша неделя? Всё ли понятно?
          </p>
          <div className="mood-buttons">
            <button
              className={`mood-btn ${activeMood === "good" ? "selected" : ""}`}
              onClick={() => setActiveMood("good")}
            >
              <Smile size={24} />
              <span>Отлично</span>
            </button>
            <button
              className={`mood-btn ${activeMood === "normal" ? "selected" : ""}`}
              onClick={() => setActiveMood("normal")}
            >
              <Meh size={24} />
              <span>Нормально</span>
            </button>
            <button
              className={`mood-btn ${activeMood === "bad" ? "selected" : ""}`}
              onClick={() => setActiveMood("bad")}
            >
              <Frown size={24} />
              <span>Сложно</span>
            </button>
          </div>
          <div
            className="flex-row align-center gap-12 p-3 bg-light rounded-lg mt-2 cursor-pointer"
            onClick={() => setHasAccess(!hasAccess)}
          >
            <div
              className={`task-checkbox ${hasAccess ? "checked" : ""}`}
            ></div>
            <span
              className="font-semibold text-dark text-sm"
              style={{ userSelect: "none" }}
            >
              У меня есть все необходимые доступы
            </span>
          </div>
        </div>
      </div>

      <div className="widget col-span-2">
        <div className="widget-title">
          Достижения
          <span className="widget-subtitle">Собрано: 2/15</span>
        </div>
        <div className="badges-list">
          {ACHIEVEMENTS_MOCK.map((achieve) => (
            <div key={achieve.id} className="badge-item">
              <div className={`badge-icon ${achieve.type}`}>
                {achieve.icon === "target" && <Target size={28} />}
                {achieve.icon === "book" && <BookOpen size={28} />}
                {achieve.icon === "lock" && <Lock size={28} />}
              </div>
              <span className="badge-title text-dark mt-2">
                {achieve.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
