import React, { useState } from 'react';
import { Plus, FileText, Search, MoreVertical, Trash2, ArrowDownAZ, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HrTemplates.css';

interface Template {
  id: string;
  name: string;
  role: string;
  stages: number;
  lastUpdated: string; // формат DD.MM.YYYY
}

type SortType = 'date' | 'alpha';

const HrTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<SortType>('date');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([
    { id: '1', name: 'Стандартный онбординг', role: 'Разработчик', stages: 5, lastUpdated: '12.10.2023' },
    { id: '2', name: 'Адаптация менеджера', role: 'Менеджер', stages: 4, lastUpdated: '05.10.2023' },
    { id: '3', name: 'Вводный курс QA', role: 'QA Инженер', stages: 3, lastUpdated: '28.09.2023' },
    { id: '4', name: 'Администратор БД', role: 'DevOps', stages: 6, lastUpdated: '15.09.2023' },
  ]);

  const filteredTemplates = templates
    .filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === 'alpha') {
        return a.name.localeCompare(b.name);
      }
      // Сортировка по дате (новые сверху)
      const dateA = a.lastUpdated.split('.').reverse().join('-');
      const dateB = b.lastUpdated.split('.').reverse().join('-');
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTemplates(prev => prev.filter(t => t.id !== id));
    setOpenMenuId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="hr-templates">
      <div className="hr-templates-header">
        <h1 className="page-title">Шаблоны адаптации</h1>
        <button 
          className="hr-btn-primary"
          onClick={() => navigate('/hr/templates/new/edit')}
        >
          <Plus size={18} />
          Создать шаблон
        </button>
      </div>

      <div className="widget">
        <div className="hr-templates-toolbar">
          <div className="hr-templates-search">
            <Search size={18} color="var(--nau-gray)" />
            <input 
              type="text"
              placeholder="Поиск по названию или роли..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-input"
            />
          </div>

          <div className="hr-sort-group">
            <span className="widget-subtitle" style={{ marginRight: '8px' }}>Сортировка:</span>
            <button 
              className={`hr-sort-btn ${sortType === 'date' ? 'active' : ''}`}
              onClick={() => setSortType('date')}
              title="По дате"
            >
              <CalendarDays size={16} />
            </button>
            <button 
              className={`hr-sort-btn ${sortType === 'alpha' ? 'active' : ''}`}
              onClick={() => setSortType('alpha')}
              title="По алфавиту"
            >
              <ArrowDownAZ size={16} />
            </button>
          </div>
        </div>

        <div className="hr-template-list">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className="hr-template-item"
              onClick={() => navigate(`/hr/templates/${template.id}/edit`)}
            >
              <div className="hr-template-icon">
                <FileText size={24} />
              </div>
              <div className="hr-template-info">
                <h4>{template.name}</h4>
                <div className="hr-template-meta">
                  <span className="task-tag">{template.role}</span>
                  <span className="widget-subtitle">{template.stages} этапов</span>
                </div>
              </div>
              <div className="hr-template-actions">
                <span className="widget-subtitle">Обновлен: {template.lastUpdated}</span>
                <div className="hr-menu-wrapper">
                  <button className="hr-icon-btn" onClick={(e) => toggleMenu(e, template.id)}>
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === template.id && (
                    <div className="hr-dropdown-menu">
                      <button className="hr-dropdown-item danger" onClick={(e) => handleDelete(e, template.id)}>
                        <Trash2 size={14} />
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="hr-empty-state">
              <p>Шаблоны не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay для закрытия меню при клике вне */}
      {openMenuId && <div className="hr-overlay" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
};

export default HrTemplates;