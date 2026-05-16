import React, { useState } from 'react';
import { UserPlus, Search, Mail, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HrEmployees.css';

type EmployeeStatus = 'adapting' | 'completed' | 'delayed';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  startDate: string;
  mentor: string;
}

const statusConfig: Record<EmployeeStatus, { label: string; icon: React.ReactNode; className: string }> = {
  adapting: { label: 'Адаптируется', icon: <Clock size={14} />, className: 'status-adapting' },
  completed: { label: 'Завершил', icon: <CheckCircle size={14} />, className: 'status-completed' },
  delayed: { label: 'Отстает', icon: <AlertCircle size={14} />, className: 'status-delayed' },
};

const HrEmployees: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const employees: Employee[] = [
    { id: '1', name: 'Алексей Смирнов', role: 'Backend Dev', department: 'Разработка', status: 'delayed', startDate: '01.10.2023', mentor: 'Иван Петров' },
    { id: '2', name: 'Мария Иванова', role: 'QA Engineer', department: 'Тестирование', status: 'adapting', startDate: '15.10.2023', mentor: 'Анна Сидорова' },
    { id: '3', name: 'Дмитрий Кузнецов', role: 'Frontend Dev', department: 'Разработка', status: 'completed', startDate: '01.08.2023', mentor: 'Иван Петров' },
    { id: '4', name: 'Елена Попова', role: 'Product Manager', department: 'Продукт', status: 'adapting', startDate: '20.10.2023', mentor: 'Сергей Волков' },
  ];

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Инвайт отправлен на: ${inviteEmail}`);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <div className="hr-employees">
      <div className="hr-employees-header">
        <h1 className="page-title">Управление сотрудниками</h1>
        <button className="hr-btn-primary" onClick={() => setIsInviteOpen(true)}>
          <UserPlus size={18} />
          Пригласить сотрудника
        </button>
      </div>

      {isInviteOpen && (
        <div className="widget hr-invite-form">
          <div className="hr-invite-header">
            <h3>Отправить инвайт</h3>
            <button className="hr-icon-btn" onClick={() => setIsInviteOpen(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleInvite} className="hr-invite-body">
            <div className="hr-templates-search">
              <Mail size={18} color="var(--nau-gray)" />
              <input 
                type="email" 
                placeholder="email@company.com" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="hr-input"
                required
              />
            </div>
            <button type="submit" className="hr-btn-primary">Отправить</button>
          </form>
        </div>
      )}

      <div className="widget">
        <div className="hr-templates-search">
          <Search size={18} color="var(--nau-gray)" />
          <input 
            type="text"
            placeholder="Поиск по имени или роли..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hr-input"
          />
        </div>

        <div className="hr-emp-table">
          <div className="hr-emp-table-header">
            <span>Сотрудник</span>
            <span>Статус</span>
            <span>Дата старта</span>
            <span>Наставник</span>
          </div>
          {filteredEmployees.map((emp) => {
            const status = statusConfig[emp.status];
            return (
              <div 
                key={emp.id} 
                className="hr-emp-row"
                onClick={() => navigate(`/hr/employees/${emp.id}/plan`)}
              >
                <div className="hr-emp-user">
                  <div className="avatar">{emp.name.charAt(0)}</div>
                  <div className="hr-emp-info">
                    <h4>{emp.name}</h4>
                    <p>{emp.role} · {emp.department}</p>
                  </div>
                </div>
                <div>
                  <span className={`task-tag ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
                <div className="hr-emp-date">{emp.startDate}</div>
                <div className="hr-emp-mentor">{emp.mentor}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HrEmployees;