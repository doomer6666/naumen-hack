import React from 'react';
import { Clock, CheckCircle, TrendingUp, AlertTriangle, BarChart3, Users } from 'lucide-react';
import './HrDashboard.css';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon }) => (
  <div className="widget hr-metric-card">
    <div className="hr-metric-icon">{icon}</div>
    <div className="hr-metric-content">
      <span className="widget-subtitle">{title}</span>
      <h3 className="hr-metric-value">{value}</h3>
      <span className="hr-metric-sub">{subtitle}</span>
    </div>
  </div>
);

const HrDashboard: React.FC = () => {
  const moodData = [
    { week: 'Нед 1', positive: 85, neutral: 10, negative: 5 },
    { week: 'Нед 2', positive: 70, neutral: 20, negative: 10 },
    { week: 'Нед 3', positive: 90, neutral: 5, negative: 5 },
    { week: 'Нед 4', positive: 75, neutral: 15, negative: 10 },
  ];

  const atRiskEmployees = [
    { id: 1, name: 'Алексей Смирнов', role: 'Backend Dev', issue: 'Задержка этапа на 5 дней' },
    { id: 2, name: 'Мария Иванова', role: 'QA Engineer', issue: 'Не пройден чекпоинт Day 14' },
  ];

  return (
    <div className="hr-dashboard">
      <h1 className="page-title">Аналитика адаптации</h1>

      <div className="hr-metrics-grid">
        <MetricCard 
          title="Среднее время адаптации" 
          value="24 дня" 
          subtitle="-3 дня от нормы" 
          icon={<Clock size={24} />}
        />
        <MetricCard 
          title="Прошли план" 
          value="87%" 
          subtitle="13 из 15 сотрудников" 
          icon={<CheckCircle size={24} />}
        />
        <MetricCard 
          title="Активные сейчас" 
          value="12" 
          subtitle="человек в процессе" 
          icon={<Users size={24} />}
        />
        <MetricCard 
          title="Индекс здоровья" 
          value="8.5 / 10" 
          subtitle="Тренд: рост 📈" 
          icon={<TrendingUp size={24} />}
        />
      </div>

      <div className="hr-charts-grid">
        <div className="widget">
          <div className="widget-title">
            <span>Настроение по неделям</span>
            <BarChart3 size={20} color="var(--nau-gray)" />
          </div>
          <div className="hr-mood-chart">
            {moodData.map((data) => (
              <div key={data.week} className="hr-mood-bar-group">
                <div className="hr-mood-bar-container">
                  <div className="hr-mood-bar positive" style={{ height: `${data.positive}%` }} />
                  <div className="hr-mood-bar neutral" style={{ height: `${data.neutral}%` }} />
                  <div className="hr-mood-bar negative" style={{ height: `${data.negative}%` }} />
                </div>
                <span className="hr-mood-label">{data.week}</span>
              </div>
            ))}
            <div className="hr-mood-legend">
              <div className="hr-legend-item"><span className="hr-legend-dot positive" />Позитив</div>
              <div className="hr-legend-item"><span className="hr-legend-dot neutral" />Нейтрально</div>
              <div className="hr-legend-item"><span className="hr-legend-dot negative" />Негатив</div>
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widget-title">
            <span>Здоровье онбординга</span>
            <span className="widget-subtitle">Общий показатель</span>
          </div>
          <div className="hr-health-bars">
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Знание процессов</span>
                <span className="widget-subtitle">92%</span>
              </div>
              <div className="hr-progress-track">
                <div className="hr-progress-fill success" style={{ width: '92%' }} />
              </div>
            </div>
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Интеграция в команду</span>
                <span className="widget-subtitle">78%</span>
              </div>
              <div className="hr-progress-track">
                <div className="hr-progress-fill warning" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Выполнение задач</span>
                <span className="widget-subtitle">65%</span>
              </div>
              <div className="hr-progress-track">
                <div className="hr-progress-fill danger" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="widget hr-risk-widget">
        <div className="widget-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--danger)" />
            Кто под угрозой срыва сроков
          </span>
          <span className="widget-subtitle">{atRiskEmployees.length} сотрудника</span>
        </div>
        <div className="hr-risk-list">
          {atRiskEmployees.map((emp) => (
            <div key={emp.id} className="hr-risk-item">
              <div className="avatar">{emp.name.charAt(0)}</div>
              <div className="hr-risk-info">
                <h4>{emp.name}</h4>
                <p>{emp.role}</p>
              </div>
              <div className="hr-risk-issue">
                <span className="task-tag" style={{ background: '#fde8e8', color: 'var(--danger)' }}>
                  {emp.issue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;