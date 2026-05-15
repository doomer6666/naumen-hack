import React from "react";
import { Square } from "lucide-react";

interface Task {
  id: number;
  title: string;
  desc: string;
  tag: string;
  tagClass: string;
  itemClass: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: 'Изучить лекцию "Инструменты автоматизации"',
    desc: "Курс «Промышленная разработка на Java»",
    tag: "Сегодня",
    tagClass: "today-tag",
    itemClass: "today",
  },
  {
    id: 2,
    title: "Пройти тест для закрепления материала",
    desc: "Тест состоит из 5 вопросов (около 5 минут)",
    tag: "Сегодня",
    tagClass: "today-tag",
    itemClass: "today",
  },
  {
    id: 3,
    title: "Встреча 1-to-1 с наставником",
    desc: "Обсуждение плана развития на испытательный срок",
    tag: "Завтра, 11:00",
    tagClass: "tomorrow-tag",
    itemClass: "tomorrow",
  },
];

const TasksWidget: React.FC = () => {
  return (
    <div className="widget">
      <div className="widget-title">Следующие шаги</div>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className={`task-item ${task.itemClass}`}>
            <div className="task-checkbox">
              <Square size={18} />
            </div>
            <div className="task-info">
              <h4>{task.title}</h4>
              <p>{task.desc}</p>
            </div>
            <div className={`task-tag ${task.tagClass}`}>{task.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksWidget;
