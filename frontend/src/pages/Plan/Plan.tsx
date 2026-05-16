import React, { useState } from "react";
import { Lock, Award, Target, ChevronDown, ChevronUp } from "lucide-react";
import "./Plan.css";
import { useAuth } from "../../context/AuthContext";

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

// === Моки ===
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
      { id: "t3", title: "Встреча с наставником", isCompleted: true },
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
      description: "Переход в статус полноценного специалиста",
    },
  },
];

export const PlanPage: React.FC = () => {
  const { role } = useAuth();
  // Редактировать могут только наставники или HR
  const isEditable = role === "mentor" || role === "hr";

  const [stages, setStages] = useState<PlanStage[]>(initialStages);
  // Храним ID раскрытых завершенных этапов
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Логика переключения задачи
  const toggleTask = (
    stageId: string,
    taskId: string,
    stageStatus: StageStatus,
  ) => {
    if (
      !isEditable ||
      stageStatus === "completed" ||
      stageStatus === "upcoming"
    )
      return;

    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id !== stageId) return stage;

        const updatedTasks = stage.tasks.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: !task.isCompleted }
            : task,
        );

        return { ...stage, tasks: updatedTasks };
      }),
    );
  };

  // Логика сворачивания/раскрытия выполненных блоков
  const toggleStageCollapse = (stageId: string) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  return (
    <div className="main-content">
      <div className="plan-container">
        <div className="plan-header">
          <h1 className="page-title">План адаптации</h1>
          <p className="page-subtitle">
            {isEditable
              ? "Отмечайте прогресс сотрудника и контролируйте прохождение этапов"
              : "Отслеживайте свой прогресс и открывайте новые этапы"}
          </p>
        </div>

        <div className="timeline">
          {stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isExpanded = expandedStages.has(stage.id);
            // Показываем контент если этап не завершен ИЛИ если он раскрыт вручную
            const showContent = !isCompleted || isExpanded;

            return (
              <div key={stage.id} className={`timeline-stage ${stage.status}`}>
                {/* Индикатор на таймлайне */}
                <div className="stage-node"></div>

                {/* Заголовок этапа */}
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
                    <p className="widget-subtitle">{stage.duration}</p>
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

                {/* Скрываемый контент */}
                {showContent && (
                  <div className="stage-content">
                    <div className="widget task-widget">
                      <div className="task-list">
                        {stage.tasks.map((task) => {
                          const isTaskDisabled =
                            !isEditable ||
                            stage.status === "completed" ||
                            stage.status === "upcoming";

                          return (
                            <div
                              key={task.id}
                              className={`task-item ${isTaskDisabled ? "disabled-item" : ""}`}
                            >
                              <div
                                className={`task-checkbox ${task.isCompleted ? "checked" : ""} ${isTaskDisabled ? "disabled" : ""}`}
                                onClick={() =>
                                  toggleTask(stage.id, task.id, stage.status)
                                }
                              />
                              <div className="task-info">
                                <h4
                                  style={{
                                    textDecoration: task.isCompleted
                                      ? "line-through"
                                      : "none",
                                    color: task.isCompleted
                                      ? "var(--nau-gray)"
                                      : "var(--nau-dark)",
                                  }}
                                >
                                  {task.title}
                                </h4>
                                {task.description && <p>{task.description}</p>}
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
          })}
        </div>
      </div>
    </div>
  );
};
