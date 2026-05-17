import React, { useState } from 'react';
import { MessageSquare, Search, Smile, Meh, Frown, AlertTriangle, CheckCircle } from 'lucide-react';
import './HrFeedbacks.css';

type Mood = 'positive' | 'neutral' | 'negative';

interface FeedbackEntry {
  id: string;
  employeeName: string;
  date: string;
  mood: Mood;
  comment: string;
}

const moodConfig: Record<Mood, { label: string; icon: React.ReactNode; classMod: string }> = {
  positive: { label: 'Хорошо', icon: <Smile size={18} />, classMod: 'mood-positive' },
  neutral: { label: 'Нормально', icon: <Meh size={18} />, classMod: 'mood-neutral' },
  negative: { label: 'Плохо', icon: <Frown size={18} />, classMod: 'mood-negative' },
};

const HrFeedbacks: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Mood | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [handledIds, setHandledIds] = useState<string[]>([]);

  const feedbacks: FeedbackEntry[] = [
    { id: '1', employeeName: 'Алексей Смирнов', date: '25.10.2023', mood: 'negative', comment: 'Не хватает доступов, жду 3 день. Процесс стоит.' },
    { id: '2', employeeName: 'Мария Иванова', date: '25.10.2023', mood: 'positive', comment: 'Отличный курс по продукту, все понятно.' },
    { id: '3', employeeName: 'Елена Попова', date: '24.10.2023', mood: 'neutral', comment: 'Много встреч, мало времени на задачи.' },
    { id: '4', employeeName: 'Дмитрий Кузнецов', date: '23.10.2023', mood: 'positive', comment: 'Ментор очень помогает, всё идет по плану.' },
    { id: '5', employeeName: 'Алексей Смирнов', date: '22.10.2023', mood: 'neutral', comment: 'Пока не ясно, что делать дальше.' },
  ];

  const filteredFeedbacks = feedbacks
    .filter(f => activeFilter === 'all' || f.mood === activeFilter)
    .filter(f => f.employeeName.toLowerCase().includes(search.toLowerCase()));

  const negativeCount = feedbacks.filter(f => f.mood === 'negative').length;

  const handleActionClick = (fbId: string, action: string) => {
    alert(`Действие: "${action}" для отзыва от ${fbId}`);
    setHandledIds([...handledIds, fbId]);
    setActiveActionId(null);
  };

  return (
    <div className="hr-feedbacks">
      <h1 className="page-title">Журнал обратной связи</h1>

      <div className="widget">
        <div className="hr-fb-controls">
          <div className="hr-fb-filters">
            <button 
              className={`hr-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Все
            </button>
            <button 
              className={`hr-filter-btn mood-positive ${activeFilter === 'positive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('positive')}
            >
              <Smile size={16} /> Хорошо
            </button>
            <button 
              className={`hr-filter-btn mood-neutral ${activeFilter === 'neutral' ? 'active' : ''}`}
              onClick={() => setActiveFilter('neutral')}
            >
              <Meh size={16} /> Нормально
            </button>
            <button 
              className={`hr-filter-btn mood-negative ${activeFilter === 'negative' ? 'active' : ''}`}
              onClick={() => setActiveFilter('negative')}
            >
              <Frown size={16} /> Плохо
              {negativeCount > 0 && <span className="hr-fb-badge">{negativeCount}</span>}
            </button>
          </div>
          
          <div className="hr-templates-search hr-fb-search">
            <Search size={18} color="var(--nau-gray)" />
            <input 
              type="text"
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-input"
            />
          </div>
        </div>

        <div className="hr-fb-list">
          {filteredFeedbacks.map((fb) => {
            const mood = moodConfig[fb.mood];
            const isHandled = handledIds.includes(fb.id);
            
            return (
              <div key={fb.id} className={`hr-fb-item ${mood.classMod}`}>
                <div className="hr-fb-header">
                  <div className="hr-fb-user">
                    <div className="avatar">{fb.employeeName.charAt(0)}</div>
                    <h4>{fb.employeeName}</h4>
                  </div>
                  <div className="hr-fb-meta">
                    <span className={`hr-mood-indicator ${mood.classMod}`}>
                      {mood.icon}
                      {mood.label}
                    </span>
                    <span className="widget-subtitle">{fb.date}</span>
                  </div>
                </div>
                <p className="hr-fb-comment">{fb.comment}</p>
                
                {fb.mood === 'negative' && (
                  <div className="hr-fb-action-wrapper">
                    {isHandled ? (
                      <button className="hr-fb-action-btn handled" disabled>
                        <CheckCircle size={14} />
                        В работе
                      </button>
                    ) : (
                      <>
                        <button 
                          className="hr-fb-action-btn"
                          onClick={() => setActiveActionId(activeActionId === fb.id ? null : fb.id)}
                        >
                          <AlertTriangle size={14} />
                          Реагировать
                        </button>
                        {activeActionId === fb.id && (
                          <div className="hr-fb-dropdown">
                            <button onClick={() => handleActionClick(fb.id, 'Написать сотруднику')}>
                              Написать сотруднику
                            </button>
                            <button onClick={() => handleActionClick(fb.id, 'Связаться с наставником')}>
                              Связаться с наставником
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredFeedbacks.length === 0 && (
            <div className="hr-empty-state">
              <MessageSquare size={32} color="var(--nau-border)" />
              <p>Отзывов не найдено</p>
            </div>
          )}
        </div>
      </div>

      {activeActionId && <div className="hr-overlay" onClick={() => setActiveActionId(null)} />}
    </div>
  );
};

export default HrFeedbacks;