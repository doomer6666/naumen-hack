import React, { useState } from 'react';
import { Search, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MenteesList.css';

type MenteeStatus = 'adapting' | 'completed' | 'delayed';

interface Mentee {
  id: string;
  name: string;
  role: string;
  status: MenteeStatus;
  progress: number;
  daysLeft: number;
}

const statusConfig: Record<MenteeStatus, { label: string; icon: React.ReactNode; classMod: string }> = {
  adapting: { label: 'В процессе', icon: <Clock size={14} />, classMod: 'status-adapting' },
  completed: { label: 'Завершен', icon: <CheckCircle size={14} />, classMod: 'status-completed' },
  delayed: { label: 'Отстает', icon: <AlertCircle size={14} />, classMod: 'status-delayed' },
};

const MenteesList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const mentees: Mentee[] = [
    { id: '1', name: 'Алексей Смирнов', role: 'Backend Dev', status: 'delayed', progress: 45, daysLeft: 14 },
    { id: '2', name: 'Мария Иванова', role: 'QA Engineer', status: 'adapting', progress: 70, daysLeft: 8 },
    { id: '3', name: 'Елена Попова', role: 'Product Manager', status: 'adapting', progress: 30, daysLeft: 21 },
    { id: '4', name: 'Дмитрий Кузнецов', role: 'Frontend Dev', status: 'completed', progress: 100, daysLeft: 0 },
  ];

  const filteredMentees = mentees.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mentees-page">
      <h1 className="page-title">Мои подопечные</h1>

      <div className="mentees-toolbar">
        <div className="hr-templates-search" style={{ margin: 0, maxWidth: '400px' }}>
          <Search size={18} color="var(--nau-gray)" />
          <input 
            type="text"
            placeholder="Поиск по имени или роли..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hr-input"
          />
        </div>
        <div className="mentees-summary">
          <Users size={18} color="var(--nau-gray)" />
          <span className="widget-subtitle">Всего: {mentees.length}</span>
        </div>
      </div>

      <div className="mentees-grid">
        {filteredMentees.map((mentee) => {
          const status = statusConfig[mentee.status];
          return (
            <div 
              key={mentee.id} 
              className="widget mentee-card"
              onClick={() => navigate(`/mentor/my-mentees/${mentee.id}/progress`)}
            >
              <div className="mentee-card-header">
                <div className="mentee-user">
                  <div className="avatar">{mentee.name.charAt(0)}</div>
                  <div>
                    <h3>{mentee.name}</h3>
                    <p>{mentee.role}</p>
                  </div>
                </div>
                <span className={`task-tag ${status.classMod}`}>
                  {status.icon}
                  {status.label}
                </span>
              </div>

              <div className="mentee-progress-section">
                <div className="mentee-progress-header">
                  <span className="widget-subtitle">Прогресс</span>
                  <span className="mentee-progress-percent">{mentee.progress}%</span>
                </div>
                <div className="hr-progress-track">
                  <div 
                    className={`hr-progress-fill ${mentee.status === 'delayed' ? 'danger' : 'brand'}`} 
                    style={{ width: `${mentee.progress}%` }} 
                  />
                </div>
              </div>

              {mentee.daysLeft > 0 ? (
                <div className="mentee-days-left">
                  <Clock size={14} color="var(--nau-gray)" />
                  <span>Осталось {mentee.daysLeft} дней</span>
                </div>
              ) : (
                <div className="mentee-days-left completed">
                  <CheckCircle size={14} color="var(--success)" />
                  <span>Адаптация завершена</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenteesList;