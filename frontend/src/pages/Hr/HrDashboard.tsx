import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Users,
  ThumbsUp,
  TrendingUp,
  Loader2,
} from "lucide-react";
import apiClient from "../../api/client";
import "./HrDashboard.css";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
}) => (
  <div className="widget hr-metric-card">
    <div className="hr-metric-icon">{icon}</div>
    <div className="hr-metric-content">
      <span className="widget-subtitle">{title}</span>
      <h3 className="hr-metric-value">{value}</h3>
      <span className="hr-metric-sub">{subtitle}</span>
    </div>
  </div>
);

interface RiskEmployee {
  id: string;
  name: string;
  role: string;
  issue: string;
}

const HrDashboard: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get("/hr/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Ошибка загрузки аналитики:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
      >
        <Loader2 size={48} className="spinner" />
      </div>
    );
  }

  const atRiskEmployees: RiskEmployee[] = analytics?.atRisk || [];

  return (
    <div className="hr-dashboard">
      <h1 className="page-title">Аналитика адаптации</h1>

      <div className="hr-metrics-grid">
        <MetricCard
          title="Средний прогресс"
          value={`${analytics?.avgProgress || 0}%`}
          subtitle="По активным планам"
          icon={<TrendingUp size={24} />}
        />
        <MetricCard
          title="Успешность планов"
          value={`${analytics?.passRate || 0}%`}
          subtitle={`Завершено планов`}
          icon={<CheckCircle size={24} />}
        />
        <MetricCard
          title="Активные сейчас"
          value={`${analytics?.active || 0}`}
          subtitle="человек в процессе"
          icon={<Users size={24} />}
        />
        <MetricCard
          title="Удовлетворенность"
          value={`${analytics?.satisfaction || 0}%`}
          subtitle="На основе пульса"
          icon={<ThumbsUp size={24} />}
        />
      </div>

      <div className="hr-charts-grid">
        <div className="widget">
          <div className="widget-title">
            <span>Общий прогресс по задачам</span>
            <span className="widget-subtitle">Активные сотрудники</span>
          </div>
          <div className="hr-health-bars">
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Выполнение задач</span>
                <span className="widget-subtitle">
                  {analytics?.avgProgress || 0}%
                </span>
              </div>
              <div className="hr-progress-track">
                <div
                  className="hr-progress-fill brand"
                  style={{ width: `${analytics?.avgProgress || 0}%` }}
                />
              </div>
            </div>
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Удовлетворенность (Пульс)</span>
                <span className="widget-subtitle">
                  {analytics?.satisfaction || 0}%
                </span>
              </div>
              <div className="hr-progress-track">
                <div
                  className="hr-progress-fill info"
                  style={{ width: `${analytics?.satisfaction || 0}%` }}
                />
              </div>
            </div>
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Успешность завершения</span>
                <span className="widget-subtitle">
                  {analytics?.passRate || 0}%
                </span>
              </div>
              <div className="hr-progress-track">
                <div
                  className="hr-progress-fill muted"
                  style={{ width: `${analytics?.passRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widget-title">
            <span>Распределение сотрудников</span>
            <span className="widget-subtitle">По статусам</span>
          </div>
          <div className="hr-health-bars">
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>В процессе</span>
                <span className="widget-subtitle">
                  {analytics?.active || 0} чел.
                </span>
              </div>
              <div className="hr-progress-track">
                <div
                  className="hr-progress-fill brand"
                  style={{
                    width: `${analytics?.active ? Math.min((analytics.active / 20) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="hr-health-item">
              <div className="hr-health-header">
                <span>Под угрозой срыва</span>
                <span
                  className="widget-subtitle"
                  style={{
                    color:
                      atRiskEmployees.length > 0
                        ? "var(--danger)"
                        : "var(--success)",
                  }}
                >
                  {atRiskEmployees.length} чел.
                </span>
              </div>
              <div className="hr-progress-track">
                <div
                  className="hr-progress-fill danger"
                  style={{
                    width: `${atRiskEmployees.length ? Math.min((atRiskEmployees.length / 5) * 100, 100) : 0}%`,
                    background: "var(--danger)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="widget hr-risk-widget">
        <div className="widget-title">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} color="var(--danger)" />
            Кто под угрозой срыва сроков
          </span>
          <span className="widget-subtitle">
            {atRiskEmployees.length} сотрудника
          </span>
        </div>
        <div className="hr-risk-list">
          {atRiskEmployees.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--nau-gray)",
              }}
            >
              <CheckCircle
                size={32}
                style={{ marginBottom: "8px", color: "var(--success)" }}
              />
              <p>Все сотрудники в норме</p>
            </div>
          ) : (
            atRiskEmployees.map((emp) => (
              <div key={emp.id} className="hr-risk-item">
                <div className="avatar">{emp.name.charAt(0)}</div>
                <div className="hr-risk-info">
                  <h4>{emp.name}</h4>
                  <p>{emp.role}</p>
                </div>
                <div className="hr-risk-issue">
                  <span
                    className="task-tag"
                    style={{ background: "#fde8e8", color: "var(--danger)" }}
                  >
                    {emp.issue}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
