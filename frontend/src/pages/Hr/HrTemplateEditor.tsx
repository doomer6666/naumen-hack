import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, GripVertical, Plus, Trash2, 
  Calendar, Link, ChevronDown, ChevronUp, Flag 
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

  const toggleStage = (stageId: string) => {
    setStages(stages.map(s => 
      s.id === stageId ? { ...s, isOpen: !s.isOpen } : s
    ));
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
    setStages(stages.map(s => 
      s.id === stageId ? { ...s, tasks: [...s.tasks, newTask] } : s
    ));
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
        />
        <button className="hr-btn-primary">
          <Save size={18} />
          Сохранить
        </button>
      </div>

      <div className="hr-editor-stages">
        {stages.map((stage) => (
          <div key={stage.id} className="hr-stage-card">
            <div className="hr-stage-header" onClick={() => toggleStage(stage.id)}>
              <div className="hr-stage-drag">
                <GripVertical size={20} color="var(--nau-gray)" />
              </div>
              <div className="hr-stage-info">
                <h3>{stage.title}</h3>
                <span className="widget-subtitle">{stage.tasks.length} задач</span>
              </div>
              <div className="hr-stage-actions">
                <button className="hr-icon-btn" onClick={(e) => { e.stopPropagation(); }}>
                  <Trash2 size={16} />
                </button>
                {stage.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {stage.isOpen && (
              <div className="hr-stage-content">
                {stage.tasks.map((task) => (
                  <div key={task.id} className="hr-task-card">
                    <div className="hr-task-drag">
                      <GripVertical size={16} color="var(--nau-gray)" />
                    </div>
                    <div className="hr-task-content">
                      <span className="hr-task-title">{task.title}</span>
                      <div className="hr-task-meta">
                        <span className="task-tag today-tag">
                          <Calendar size={12} style={{ marginRight: '4px' }} />
                          {task.deadline}
                        </span>
                        {task.jiraTemplate && (
                          <span className="task-tag" style={{ background: '#e3eafc', color: '#3b82f6' }}>
                            <Link size={12} style={{ marginRight: '4px' }} />
                            Jira: {task.jiraTemplate}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="hr-icon-btn">
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