import React, { useState } from "react";
import { AlertTriangle, UserPlus, Layout, MailWarning } from "lucide-react";

interface HRAnalytics {
  avgTime: string;
  onTrackPercent: number;
  engagementIndex: number;
}

interface RiskEmployee {
  id: string;
  name: string;
  role: string;
  reason: string;
  daysDelayed: number;
}

const ANALYTICS_MOCK: HRAnalytics = {
  avgTime: "2.5 месяца",
  onTrackPercent: 78,
  engagementIndex: 8.4,
};

const INITIAL_RISK_MOCK: RiskEmployee[] = [
  {
    id: "1",
    name: "Илья Петров",
    role: "Инженер инфраструктуры",
    reason: "Нет доступов к рабочим серверам",
    daysDelayed: 4,
  },
  {
    id: "2",
    name: "Анна Ким",
    role: "Дизайнер интерфейсов",
    reason: "Низкая оценка в еженедельном опросе",
    daysDelayed: 0,
  },
];

const TEMPLATES_MOCK = [
  { id: "t1", title: "Разработчик (Уверенный специалист)", tasks: 24 },
  { id: "t2", title: "Специалист по продажам", tasks: 15 },
];

export const HRCabinet: React.FC = () => {
  const [risks, setRisks] = useState<RiskEmployee[]>(INITIAL_RISK_MOCK);

  // Имитация разрешения проблемы сотрудника
  const handleResolveRisk = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="dashboard-grid">
      <div className="widget">
        <div className="widget-title">Общая сводка</div>
        <div className="progress-wrapper justify-between gap-20">
          <div
            className="progress-chart"
            style={{
              width: "100px",
              height: "100px",
              background: `conic-gradient(var(--success) ${ANALYTICS_MOCK.onTrackPercent}%, var(--nau-light-gray) 0)`,
            }}
          >
            <div
              className="progress-inner"
              style={{ width: "76px", height: "76px" }}
            >
              <span className="percent" style={{ fontSize: "20px" }}>
                {ANALYTICS_MOCK.onTrackPercent}%
              </span>
              <span className="label" style={{ fontSize: "9px" }}>
                В срок
              </span>
            </div>
          </div>
          <div className="stats-list">
            <div className="stat-row">
              <span className="stat-label">Среднее время:</span>
              <strong className="stat-value">{ANALYTICS_MOCK.avgTime}</strong>
            </div>
            <div className="stat-row">
              <span className="stat-label">Оценка вовлеченности:</span>
              <strong className="stat-value text-success">
                {ANALYTICS_MOCK.engagementIndex} / 10
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Шаблоны адаптации</div>
        <div className="mood-buttons mb-4">
          <button
            className="mood-btn row selected"
            onClick={() => alert("Открытие модалки: Пригласить")}
          >
            <UserPlus size={18} />
            <span>Пригласить</span>
          </button>
          <button
            className="mood-btn row"
            onClick={() => alert("Открытие конструктора")}
          >
            <Layout size={18} />
            <span>Создать</span>
          </button>
        </div>
        <div className="widget-subtitle mb-3">Популярные программы:</div>
        <div className="task-list">
          {TEMPLATES_MOCK.map((t) => (
            <div
              key={t.id}
              className="task-item align-center justify-between p-3 cursor-pointer"
            >
              <span className="font-semibold text-dark text-sm">{t.title}</span>
              <span className="text-gray text-sm">{t.tasks} задач</span>
            </div>
          ))}
        </div>
      </div>

      <div className="widget col-span-2">
        <div className="widget-title text-danger">
          <div className="flex-row align-center gap-8">
            <AlertTriangle size={20} /> Сотрудники в зоне риска
          </div>
          <span className="task-tag danger-tag">{risks.length} чел.</span>
        </div>

        <div className="task-list">
          {risks.length === 0 ? (
            <div className="text-gray mt-2 font-semibold">
              Все проблемы успешно разобраны! 🎉
            </div>
          ) : (
            risks.map((emp) => (
              <div
                key={emp.id}
                className="task-item danger align-center justify-between"
              >
                <div className="task-info">
                  <h4 className="flex-row align-center gap-12 mb-2 m-0 text-dark">
                    {emp.name}
                    <span className="font-normal text-gray text-sm">
                      {emp.role}
                    </span>
                  </h4>
                  <p className="flex-row align-center gap-8 text-dark m-0">
                    <MailWarning size={16} className="text-danger" />{" "}
                    {emp.reason}
                  </p>
                </div>
                <div className="flex-col gap-8 align-end">
                  {emp.daysDelayed > 0 && (
                    <div className="task-tag danger-filled">
                      Просрочено на: {emp.daysDelayed} дн.
                    </div>
                  )}
                  <button
                    className="mood-btn auto-width"
                    onClick={() => handleResolveRisk(emp.id)}
                  >
                    Разобрать ситуацию
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
