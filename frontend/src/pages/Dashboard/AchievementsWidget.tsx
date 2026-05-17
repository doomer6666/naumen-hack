import React, { useState, useEffect } from "react";
import {
  Trophy,
  Lock,
  Award,
  Loader2,
  Target,
  Heart,
  Rocket,
  Calendar,
} from "lucide-react";
import apiClient from "../../api/client";

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  heart: Heart,
  rocket: Rocket,
  calendar: Calendar,
};

export const AchievementsWidget: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await apiClient.get("/gamification/my-progress");
        setBadges(res.data.badges || []);
      } catch (err) {
        console.error("Ошибка загрузки достижений:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div
        className="widget"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "150px",
        }}
      >
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="widget">
      <div className="widget-title">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={20} color="var(--nau-orange)" />
          Ваши достижения
        </div>
        <span className="widget-subtitle">
          Собрано: {earnedCount} из {badges.length}
        </span>
      </div>

      <div
        className="badges-list"
        style={{ justifyContent: "flex-start", gap: "16px" }}
      >
        {badges.length === 0 ? (
          <p className="text-gray text-sm">Достижений пока нет</p>
        ) : (
          badges.map((badge) => {
            const IconComponent = iconMap[badge.icon_url] || Award;
            const isEarned = badge.earned;

            return (
              <div
                key={badge.id}
                className="badge-item"
                style={{ opacity: isEarned ? 1 : 0.4 }}
              >
                <div className={`badge-icon ${isEarned ? "gold" : "locked"}`}>
                  {isEarned ? <IconComponent size={24} /> : <Lock size={24} />}
                </div>
                <span
                  className={`badge-title mt-1 ${isEarned ? "text-dark" : "text-gray"}`}
                  style={{ fontSize: "12px", textAlign: "center" }}
                >
                  {badge.name}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
