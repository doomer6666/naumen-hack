import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import "./MenteesList.css";

type MenteeStatus = "adapting" | "completed" | "delayed";

interface Mentee {
  id: string;
  name: string;
  role: string;
  status: MenteeStatus;
  progress: number;
  latest_mood: number | null;
}

const statusConfig: Record<
  MenteeStatus,
  { label: string; icon: React.ReactNode; classMod: string }
> = {
  adapting: {
    label: "В процессе",
    icon: <Clock size={14} />,
    classMod: "status-adapting",
  },
  completed: {
    label: "Завершен",
    icon: <CheckCircle size={14} />,
    classMod: "status-completed",
  },
  delayed: {
    label: "Отстает",
    icon: <AlertCircle size={14} />,
    classMod: "status-delayed",
  },
};

const getMoodIcon = (score: number | null) => {
  if (!score) return <Meh size={14} className="text-gray" />;
  if (score >= 8)
    return <Smile size={14} style={{ color: "var(--success)" }} />;
  if (score >= 5)
    return <Meh size={14} style={{ color: "var(--nau-orange)" }} />;
  return <Frown size={14} style={{ color: "var(--danger)" }} />;
};

const MenteesList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const res = await apiClient.get("/mentor/my-mentees");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedMentees = res.data.mentees.map((m: any) => {
          const total = parseInt(m.total_tasks, 10) || 0;
          const done = parseInt(m.done_tasks, 10) || 0;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          let status: MenteeStatus = "adapting";
          if (m.plan_status === "completed") {
            status = "completed";
          } else if (m.latest_mood !== null && m.latest_mood < 5) {
            status = "delayed";
          }

          return {
            id: m.id,
            name: m.name,
            role: m.position || "Сотрудник",
            status,
            progress,
            latest_mood: m.latest_mood,
          };
        });
        setMentees(mappedMentees);
      } catch (err) {
        console.error("Ошибка загрузки подопечных:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const filteredMentees = mentees.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
      >
        <Loader2 size={40} className="spinner" />
      </div>
    );
  }

  return (
    <div className="mentees-page">
      <h1 className="page-title">Мои подопечные</h1>

      <div className="mentees-toolbar">
        <div
          className="hr-templates-search"
          style={{ margin: 0, maxWidth: "400px" }}
        >
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
        {filteredMentees.length === 0 ? (
          <div
            className="text-center p-4 text-gray text-sm"
            style={{ gridColumn: "1 / -1" }}
          >
            <Users size={32} style={{ margin: "0 auto 8px" }} />
            <p>Подопечных не найдено</p>
          </div>
        ) : (
          filteredMentees.map((mentee) => {
            const status = statusConfig[mentee.status];
            return (
              <div
                key={mentee.id}
                className="widget mentee-card"
                onClick={() => navigate(`/mentor/mentee/${mentee.id}/plan`)}
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
                    <span className="mentee-progress-percent">
                      {mentee.progress}%
                    </span>
                  </div>
                  <div className="hr-progress-track">
                    <div
                      className={`hr-progress-fill ${mentee.status === "delayed" ? "danger" : "brand"}`}
                      style={{ width: `${mentee.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mentee-days-left">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {getMoodIcon(mentee.latest_mood)}
                    <span className="text-sm text-gray">
                      Пульс:{" "}
                      {mentee.latest_mood
                        ? `${mentee.latest_mood}/10`
                        : "Нет данных"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MenteesList;
