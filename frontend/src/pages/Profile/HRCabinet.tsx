/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  FileText,
  Loader2,
  Smile,
  Meh,
  Frown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import apiClient from "../../api/client";
import "./HRCabinet.css";

const getMoodIcon = (score: number) => {
  if (score >= 8)
    return <Smile size={20} style={{ color: "var(--success)" }} />;
  if (score >= 5)
    return <Meh size={20} style={{ color: "var(--nau-orange)" }} />;
  return <Frown size={20} style={{ color: "var(--danger)" }} />;
};

export const HRCabinet: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analRes, fbRes] = await Promise.allSettled([
          apiClient.get("/hr/analytics"),
          apiClient.get("/hr/feedbacks"),
        ]);

        if (analRes.status === "fulfilled") setAnalytics(analRes.value.data);
        if (fbRes.status === "fulfilled")
          setFeedbacks(fbRes.value.data.slice(0, 5));
      } catch (error) {
        console.error("Ошибка загрузки данных HR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader2 size={40} className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <div className="widget">
        <div className="widget-title">На контроле</div>
        <div
          className="progress-stats"
          style={{ flexDirection: "column", gap: "16px" }}
        >
          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <Users
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              В адаптации:
            </span>
            <strong>{analytics?.in_progress || 0} сотрудников</strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <AlertTriangle
                size={16}
                style={{
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "var(--danger)",
                }}
              />
              Средний пульс:
            </span>
            <strong
              style={{
                color:
                  Number(analytics?.avg_mood) >= 7
                    ? "var(--success)"
                    : "var(--danger)",
              }}
            >
              {analytics?.avg_mood || "Нет данных"} / 10
            </strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Завершено:</span>
            <strong>{analytics?.completed || 0} человек</strong>
          </p>
        </div>
      </div>

      <div className="widget">
        <div className="widget-title">Быстрые действия</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            className="mood-btn"
            style={{ padding: "12px", flexDirection: "row", gap: "12px" }}
          >
            <FileText size={18} /> Создать шаблон
          </button>
        </div>
      </div>

      <div className="widget" style={{ gridColumn: "span 2" }}>
        <div className="widget-title">
          Пульс команды
          <span className="widget-subtitle">Последние ответы</span>
        </div>
        <div className="hr-pulse-list">
          {feedbacks.length === 0 ? (
            <p className="text-gray text-sm text-center" style={{ padding: "24px 0" }}>
              Пока никто не оставлял обратную связь
            </p>
          ) : (
            feedbacks.map((fb: any) => (
              <div key={fb.id} className="hr-pulse-item">
                <div className="hr-pulse-icon-wrapper">
                  {getMoodIcon(fb.mood_score)}
                </div>
                <div className="hr-pulse-content">
                  <h4>{fb.user_name || "Сотрудник"}</h4>
                  <div className="hr-pulse-tags">
                    <span className="task-tag hr-pulse-score">
                      Оценка: {fb.mood_score}/10
                    </span>
                    {fb.has_access ? (
                      <span className="task-tag hr-pulse-access-yes">
                        <CheckCircle size={12} /> Доступы есть
                      </span>
                    ) : (
                      <span className="task-tag hr-pulse-access-no">
                        <XCircle size={12} /> Нет доступов
                      </span>
                    )}
                  </div>
                  {fb.blockers && (
                    <p className="hr-pulse-blocker">
                      Блокеры: {fb.blockers}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HRCabinet;