import React, { useState } from "react";
import { Check, Lock, Award, Target } from "lucide-react";
import "./Plan.css";

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
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

//Моки
const initialStages: PlanStage[] = [
  {
    id: "stage-1",
    title: "Неделя 1: Погружение",
    duration: "Дни 1-7",
    status: "completed",
    tasks: [
      {
        id: "t1",
        title: "Оформить доступы",
        description: "Jira, Confluence, Gitlab",
        isCompleted: true,
      },
      { id: "t2", title: "Изучить структуру компании", isCompleted: true },
      { id: "t3", title: "Встреча с ментором", isCompleted: true },
    ],
    milestone: {
      title: "Первые шаги сделаны",
      description: "Базовая инфраструктура настроена",
    },
  },
  {
    id: "stage-2",
    title: "Месяц 1: Первые задачи",
    duration: "Дни 8-30",
    status: "in-progress",
    tasks: [
      {
        id: "t4",
        title: "Изучить дизайн-систему NAUMEN",
        description: "Цвета, типографика, компоненты",
        isCompleted: true,
      },
      {
        id: "t5",
        title: "Сверстать первый виджет",
        description: "Использовать React + TS",
        isCompleted: false,
      },
      { id: "t6", title: "Пройти ревью кода", isCompleted: false },
    ],
    milestone: {
      title: "Автономная работа",
      description: "Закрыт испытательный срок первого месяца",
    },
  },
  {
    id: "stage-3",
    title: "Месяц 3: Самостоятельность",
    duration: "Дни 31-90",
    status: "upcoming",
    tasks: [
      { id: "t7", title: "Разработать новый модуль", isCompleted: false },
      { id: "t8", title: "Провести демо для команды", isCompleted: false },
    ],
    milestone: {
      title: "Завершение адаптации",
      description: "Переход в статус Full-time специалиста",
    },
  },
];

export const PlanPage: React.FC = () => {
  const [stages, setStages] = useState<PlanStage[]>(initialStages);

  const toggleTask = (stageId: string, taskId: string) => {
    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id !== stageId || stage.status === "upcoming") return stage;

        const updatedTasks = stage.tasks.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: !task.isCompleted }
            : task,
        );

        return { ...stage, tasks: updatedTasks };
      }),
    );
  };

  return (
    <>
      <div className="plan-container">
        <div className="plan-header">
          <h1 className="page-title">План адаптации</h1>
          <p className="page-subtitle">
            Отслеживайте свой прогресс и открывайте новые этапы
          </p>
        </div>

        <div className="timeline">
          {stages.map((stage) => (
            <div key={stage.id} className={`timeline-stage ${stage.status}`}>
              {/* Индикатор на таймлайне */}
              <div className="stage-node">
                {stage.status === "completed" && (
                  <Check size={14} strokeWidth={3} />
                )}
              </div>

              {/* Заголовок этапа */}
              <div className="stage-header">
                <div className="stage-title-wrap">
                  <span className="stage-status">
                    {stage.status === "completed"
                      ? "Выполнено"
                      : stage.status === "in-progress"
                        ? "В процессе"
                        : "Впереди"}
                  </span>
                  <h3>{stage.title}</h3>
                  <p className="widget-subtitle">{stage.duration}</p>
                </div>
              </div>

              {/* Карточка с задачами */}
              <div className="widget">
                <div className="task-list">
                  {stage.tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div
                        className={`task-checkbox ${task.isCompleted ? "checked" : ""}`}
                        onClick={() => toggleTask(stage.id, task.id)}
                      >
                        {task.isCompleted && (
                          <Check size={14} strokeWidth={3} />
                        )}
                      </div>
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        {task.description && <p>{task.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Контрольная точка (Milestone) */}
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
                <div className="milestone-info" style={{ flex: 1 }}>
                  <h4>{stage.milestone.title}</h4>
                  <p>{stage.milestone.description}</p>
                </div>
                {stage.status === "upcoming" && (
                  <div
                    className="task-tag"
                    style={{
                      background: "var(--nau-light-gray)",
                      color: "var(--nau-gray)",
                    }}
                  >
                    Заблокировано
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PlanPage;
