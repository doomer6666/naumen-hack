import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Flag, MessageSquare, Smile, Meh, Frown } from 'lucide-react';
import './MenteeProgress.css';

interface Task {
  id: string;
  title: string;
  deadline: string;
  isCompleted: boolean;
  isCheckpoint: boolean;
}

interface Stage {
  id: string;
  title: string;
  tasks: Task[];
}

interface Feedback {
  mood: 'positive' | 'neutral' | 'negative';
  text: string;
  date: string;
}

const MenteeProgress: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [stages, setStages] = useState<Stage[]>([
    {
      id: 's1',
      title: 'Day 1: Первые шаги',
      tasks: [
        { id: 't1', title: 'Выдать доступы к CRM', deadline: 'Day 1', isCompleted: true, isCheckpoint: false },
        { id: 't2', title: 'Познакомить с командой', deadline: 'Day 1', isCompleted: true, isCheckpoint: false },
      ],
    },
    {
      id: 's2',
      title: 'Day 7: Погружение',
      tasks: [
        { id: 't3', title: 'Пройти курс по продукту', deadline: 'Day 7', isCompleted: true, isCheckpoint: false },
        { id: 't4', title: 'Контрольная точка: Синхронизация', deadline: 'Day 7', isCompleted: false, isCheckpoint: true },
      ],
    },
    {
      id: 's3',
      title: 'Month 1: Первые результаты',
      tasks: [
        { id: 't5', title: 'Закрыть первый тикет в Jira', deadline: 'Month 1', isCompleted: false, isCheckpoint: false },
        { id: 't6', title: 'Контрольная точка: Итоги месяца', deadline: 'Month 1', isCompleted: false, isCheckpoint: true },
      ],
    },
  ]);

  const feedback: Feedback = {
    mood: 'neutral',
    text: 'Процесс идет нормально, но хотелось бы больше практики с кодом. Немного застрял на настройке окружения.',
    date: '25.10.2023'
  };

  const moodConfig = {
    positive: { icon: <Smile size={20} />, label: 'Хорошо', classMod: 'positive' },
    neutral: { icon: <Meh size={20} />, label: 'Нормально', classMod: 'neutral' },
    negative: { icon: <Frown size={20} />, label: 'Плохо', classMod: 'negative' },
  };

  const handleConfirmCheckpoint = (stageId: string, taskId: string) => {
    setStages(stages.map(s => 
      s.id === stageId 
        ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, isCompleted: true } : t) } 
        : s
    ));
  };

  const currentMood = moodConfig[feedback.mood];

  return (
    <div className="mentee-progress-page">
      <div className="hr-editor-header">
        <button className="hr-icon-btn-lg" onClick={() => navigate('/mentor/my-mentees')}>
          <ArrowLeft size={20} />
        </button>
        <div className="hr-emp-plan-title">
          <h1 className="page-title">Алексей Смирнов</h1>
          <span className="task-tag status-delayed" style={{ alignSelf: 'center' }}>Отстает</span>
        </div>
      </div>

      <div className="mentee-feedback-widget widget">
        <div className="widget-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--nau-orange)" />
            Последняя обратная связь
          </span>
          <span className="widget-subtitle">{feedback.date}</span>
        </div>
        <div className="mentee-feedback-content">
          <div className={`mentee-mood-badge ${currentMood.classMod}`}>
            {currentMood.icon}
            {currentMood.label}
          </div>
          <p className="mentee-feedback-text">{feedback.text}</p>
        </div>
      </div>

      <div className="mentee-plan-stages">
        {stages.map((stage) => (
          <div key={stage.id} className="widget mentee-stage-card">
            <div className="mentee-stage-header">
              <h3 className="widget-title" style={{ margin: 0 }}>{stage.title}</h3>
              <span className="widget-subtitle">
                {stage.tasks.filter(t => t.isCompleted).length} / {stage.tasks.length}
              </span>
            </div>
            
            <div className="mentee-task-list">
              {stage.tasks.map((task) => (
                <div key={task.id} className={`mentee-task-item ${task.isCompleted ? 'completed' : ''}`}>
                  <div className="mentee-task-status">
                    {task.isCompleted ? (
                      <CheckCircle size={20} color="var(--success)" />
                    ) : (
                      <Circle size={20} color="var(--nau-border)" />
                    )}
                  </div>
                  <div className="mentee-task-info">
                    <span className="mentee-task-title">
                      {task.isCheckpoint && <Flag size={14} className="checkpoint-icon" />}
                      {task.title}
                    </span>
                    <span className="task-tag today-tag">{task.deadline}</span>
                  </div>
                  
                  {task.isCheckpoint && !task.isCompleted && (
                    <button 
                      className="mentee-confirm-btn"
                      onClick={() => handleConfirmCheckpoint(stage.id, task.id)}
                    >
                      <CheckCircle size={16} />
                      Подтвердить
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenteeProgress;