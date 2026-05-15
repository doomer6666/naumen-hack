import React from "react";

interface ProgressWidgetProps {
  percent: number;
  tasksCompleted: number;
  totalTasks: number;
  coursesCompleted: number;
  totalCourses: number;
  daysLeft: number;
}

const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  percent,
  tasksCompleted,
  totalTasks,
  coursesCompleted,
  totalCourses,
  daysLeft,
}) => {
  return (
    <div className="widget">
      <div className="widget-title">
        Прогресс адаптации
        <span className="widget-subtitle">Этап 1: Погружение</span>
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
            Пройдено курсов:{" "}
            <strong>
              {coursesCompleted} из {totalCourses}
            </strong>
          </p>
          <p>
            Дней до конца этапа: <strong>{daysLeft}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;
