import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import './HrEmployeePlan.css';

interface Task {
  id: string;
  title: string;
  deadline: string;
  isCompleted: boolean;
}

interface Stage {
  id: string;
  title: string;
  isOpen: boolean;
  tasks: Task[];
}

const HrEmployeePlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState('Иван Петров');
  
  const [stages, setStages] = useState<Stage[]>([
    {
      id: 's1',
      title: 'Day 1: Первые шаги',
      isOpen: true,
      tasks: [
        { id: 't1', title: 'Выдать доступы к CRM', deadline: 'Day 1', isCompleted: true },
        { id: 't2', title: 'Познакомить с командой', deadline: 'Day 1', isCompleted: true },
      ],
    },
    {
      id: 's2',
      title: 'Day 7: Погружение',
      isOpen: true,
      tasks: [
        { id: 't3', title: 'Пройти курс по продукту', deadline: 'Day 7', isCompleted: false },
        { id: 't4', title: 'Контрольная точка с ментором', deadline: 'Day 7', isCompleted: false },
      ],
    },
  ]);

  // Состояния для Drag-and-Drop
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{ stageId: string; taskId: string } | null>(null);

  const toggleStage = (stageId: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, isOpen: !s.isOpen } : s));
  };

  const addTask = (stageId: string) => {
    const newTask: Task = { id: `t${Date.now()}`, title: 'Новая задача', deadline: 'Day 14', isCompleted: false };
    setStages(stages.map(s => s.id === stageId ? { ...s, tasks: [...s.tasks, newTask] } : s));
  };

  const toggleTask = (stageId: string, taskId: string) => {
    setStages(stages.map(s => 
      s.id === stageId 
        ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) } 
        : s
    ));
  };

  // --- Удаление ---
  const deleteStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  const deleteTask = (stageId: string, taskId: string) => {
    setStages(stages.map(s => 
      s.id === stageId ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) } : s
    ));
  };

  // --- Логика перетаскивания этапов ---
  const handleStageDragStart = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleStageDrop = (e: React.DragEvent<HTMLDivElement>, targetStageId: string) => {
    e.preventDefault();
    if (!draggedStageId || draggedStageId === targetStageId) return;

    const updatedStages = [...stages];
    const draggedIndex = updatedStages.findIndex(s => s.id === draggedStageId);
    const targetIndex = updatedStages.findIndex(s => s.id === targetStageId);

    const [removed] = updatedStages.splice(draggedIndex, 1);
    updatedStages.splice(targetIndex, 0, removed);

    setStages(updatedStages);
    setDraggedStageId(null);
  };

  // --- Логика перетаскивания задач ---
  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, stageId: string, taskId: string) => {
    setDraggedTaskInfo({ stageId, taskId });
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation(); // Чтобы не сработал drag этапа
  };

  const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.stopPropagation();
  };

  const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, targetStageId: string, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTaskInfo || (draggedTaskInfo.stageId === targetStageId && draggedTaskInfo.taskId === targetTaskId)) return;

    const updatedStages = [...stages].map(s => ({ ...s, tasks: [...s.tasks] }));
    const sourceStage = updatedStages.find(s => s.id === draggedTaskInfo.stageId);
    const targetStage = updatedStages.find(s => s.id === targetStageId);

    if (!sourceStage || !targetStage) return;

    const draggedTaskIndex = sourceStage.tasks.findIndex(t => t.id === draggedTaskInfo.taskId);
    const [draggedTask] = sourceStage.tasks.splice(draggedTaskIndex, 1);

    const targetTaskIndex = targetStage.tasks.findIndex(t => t.id === targetTaskId);
    targetStage.tasks.splice(targetTaskIndex, 0, draggedTask);

    setStages(updatedStages);
    setDraggedTaskInfo(null);
  };

  return (
    <div className="hr-emp-plan">
      <div className="hr-editor-header">
        <button className="hr-icon-btn-lg" onClick={() => navigate('/hr/employees')}>
          <ArrowLeft size={20} />
        </button>
        <div className="hr-emp-plan-title">
          <h1 className="page-title">План: Алексей Смирнов</h1>
          <span className="task-tag status-delayed" style={{ alignSelf: 'center' }}>Отстает</span>
        </div>
        <button className="hr-btn-primary">
          <Save size={18} />
          Сохранить
        </button>
      </div>

      <div className="widget hr-emp-mentor-card">
        <div className="hr-emp-mentor-label">Наставник</div>
        <div className="hr-emp-mentor-select">
          <User size={20} color="var(--nau-orange)" />
          <input 
            type="text" 
            value={mentor} 
            onChange={(e) => setMentor(e.target.value)}
            className="hr-input-inline"
          />
        </div>
      </div>

      <div className="hr-editor-stages">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className={`hr-stage-card ${draggedStageId === stage.id ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleStageDragStart(e, stage.id)}
            onDragOver={handleStageDragOver}
            onDrop={(e) => handleStageDrop(e, stage.id)}
          >
            <div className="hr-stage-header" onClick={() => toggleStage(stage.id)}>
              <div className="hr-stage-drag"><GripVertical size={20} color="var(--nau-gray)" /></div>
              <div className="hr-stage-info">
                <h3>{stage.title}</h3>
                <span className="widget-subtitle">{stage.tasks.filter(t => t.isCompleted).length} / {stage.tasks.length} выполнено</span>
              </div>
              <div className="hr-stage-actions">
                <button className="hr-icon-btn" onClick={(e) => { e.stopPropagation(); deleteStage(stage.id); }}>
                  <Trash2 size={16} />
                </button>
                {stage.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {stage.isOpen && (
              <div className="hr-stage-content">
                {stage.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`hr-task-card ${task.isCompleted ? 'completed' : ''} ${draggedTaskInfo?.taskId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, stage.id, task.id)}
                    onDragOver={handleTaskDragOver}
                    onDrop={(e) => handleTaskDrop(e, stage.id, task.id)}
                  >
                    <div className="hr-task-drag"><GripVertical size={16} color="var(--nau-gray)" /></div>
                    <button className="hr-checkbox" onClick={() => toggleTask(stage.id, task.id)}>
                      {task.isCompleted && <CheckIcon />}
                    </button>
                    <div className="hr-task-content">
                      <span className="hr-task-title">{task.title}</span>
                      <span className="task-tag today-tag">
                        <Calendar size={12} style={{ marginRight: '4px' }} />
                        {task.deadline}
                      </span>
                    </div>
                    <button className="hr-icon-btn" onClick={() => deleteTask(stage.id, task.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button className="hr-add-task-btn" onClick={() => addTask(stage.id)}>
                  <Plus size={16} />
                  Добавить задачу
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Микро-компонент для галочки
const CheckIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--nau-white)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default HrEmployeePlan;