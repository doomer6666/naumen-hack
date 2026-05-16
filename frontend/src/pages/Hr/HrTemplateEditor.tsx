import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, GripVertical, Plus, Trash2, 
  Calendar, Link, ChevronDown, ChevronUp 
} from 'lucide-react';
import './HrTemplateEditor.css';

interface Task {
  id: string;
  title: string;
  deadline: string;
  jiraTemplate?: string;
}

interface Stage {
  id: string;
  title: string;
  isOpen: boolean;
  tasks: Task[];
}

const HrTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState(
    id === 'new' ? 'Новый шаблон' : 'Стандартный онбординг'
  );

  const [stages, setStages] = useState<Stage[]>([
    {
      id: 's1',
      title: 'Day 1: Первые шаги',
      isOpen: true,
      tasks: [
        { id: 't1', title: 'Выдать доступы к CRM', deadline: 'Day 1', jiraTemplate: 'ACCESS-1' },
        { id: 't2', title: 'Познакомить с командой', deadline: 'Day 1' },
      ],
    },
    {
      id: 's2',
      title: 'Day 7: Погружение',
      isOpen: false,
      tasks: [
        { id: 't3', title: 'Пройти курс по продукту', deadline: 'Day 7', jiraTemplate: 'LEARN-3' },
        { id: 't4', title: 'Контрольная точка с ментором', deadline: 'Day 7' },
      ],
    },
    {
      id: 's3',
      title: 'Month 1: Первые результаты',
      isOpen: false,
      tasks: [
        { id: 't5', title: 'Закрыть первый тикет в Jira', deadline: 'Month 1' },
      ],
    },
  ]);

  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{ stageId: string; taskId: string } | null>(null);

  const toggleStage = (stageId: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, isOpen: !s.isOpen } : s));
  };

  const addStage = () => {
    const newStage: Stage = {
      id: `s${Date.now()}`,
      title: 'Новый этап',
      isOpen: true,
      tasks: []
    };
    setStages([...stages, newStage]);
  };

  const addTask = (stageId: string) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: 'Новая задача',
      deadline: 'Day 1'
    };
    setStages(stages.map(s => s.id === stageId ? { ...s, tasks: [...s.tasks, newTask] } : s));
  };

  const updateStageTitle = (stageId: string, newTitle: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, title: newTitle } : s));
  };

  const updateTaskField = (stageId: string, taskId: string, field: keyof Task, value: string) => {
    setStages(stages.map(s => s.id === stageId ? {
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t)
    } : s));
  };

  const deleteStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  const deleteTask = (stageId: string, taskId: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) } : s));
  };

  // Блокировка перетаскивания, если пользователь редактирует текст
  const isEditing = () => (document.activeElement as HTMLElement)?.tagName === 'INPUT';

  const handleStageDragStart = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
    if (isEditing()) { e.preventDefault(); return; }
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

  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, stageId: string, taskId: string) => {
    if (isEditing()) { e.preventDefault(); return; }
    setDraggedTaskInfo({ stageId, taskId });
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
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
    <div className="hr-template-editor">
      <div className="hr-editor-header">
        <button className="hr-icon-btn-lg" onClick={() => navigate('/hr/templates')}>
          <ArrowLeft size={20} />
        </button>
        <input 
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="hr-editor-title-input"
          onMouseDown={(e) => e.stopPropagation()}
        />
        <button className="hr-btn-primary">
          <Save size={18} />
          Сохранить
        </button>
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
              <div className="hr-stage-drag" onMouseDown={(e) => e.stopPropagation()}>
                <GripVertical size={20} color="var(--nau-gray)" />
              </div>
              <div className="hr-stage-info">
                <input 
                  type="text"
                  value={stage.title}
                  onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                  className="hr-editable-input hr-editable-stage-title"
                  size={Math.max(stage.title.length, 5)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="hr-stage-subtitle">{stage.tasks.length} задач</span>
              </div>
              <div className="hr-stage-actions">
                <button className="hr-icon-btn" onClick={(e) => { e.stopPropagation(); deleteStage(stage.id); }}>
                  <Trash2 size={16} />
                </button>
                <div className="hr-chevron-btn">
                  {stage.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {stage.isOpen && (
              <div className="hr-stage-content">
                {stage.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`hr-task-card ${draggedTaskInfo?.taskId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, stage.id, task.id)}
                    onDragOver={handleTaskDragOver}
                    onDrop={(e) => handleTaskDrop(e, stage.id, task.id)}
                  >
                    <div className="hr-task-drag">
                      <GripVertical size={16} color="var(--nau-gray)" />
                    </div>
                    <div className="hr-task-content">
                      <input 
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTaskField(stage.id, task.id, 'title', e.target.value)}
                        className="hr-editable-input hr-editable-task-title"
                        size={Math.max(task.title.length, 5)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                      <div className="hr-task-meta">
                        <div className="hr-editable-tag-wrapper">
                          <Calendar size={12} style={{ flexShrink: 0 }} />
                          <input 
                            type="text"
                            value={task.deadline}
                            onChange={(e) => updateTaskField(stage.id, task.id, 'deadline', e.target.value)}
                            className="hr-editable-input hr-editable-deadline"
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {task.jiraTemplate && (
                          <span className="task-tag hr-jira-tag">
                            <Link size={12} />
                            <input 
                              type="text"
                              value={task.jiraTemplate}
                              onChange={(e) => updateTaskField(stage.id, task.id, 'jiraTemplate', e.target.value)}
                              className="hr-editable-input hr-editable-jira"
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                          </span>
                        )}
                      </div>
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

        <button className="hr-add-stage-btn" onClick={addStage}>
          <Plus size={20} />
          Добавить этап
        </button>
      </div>
    </div>
  );
};

export default HrTemplateEditor;