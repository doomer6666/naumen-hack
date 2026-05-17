/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Zap,
  Key,
  Calendar,
  Star,
  Lock,
  Trophy,
  Target,
  Flag,
  Award,
  Heart,
  Rocket,
  Loader2,
  AlertCircle,
} from "lucide-react";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./Achievements.css";

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  heart: Heart,
  rocket: Rocket,
  calendar: Calendar,
  zap: Zap,
  key: Key,
  star: Star,
  flag: Flag,
};

interface LeaderboardUser {
  id: string;
  name: string;
  level: number;
  xp: number;
}

export const AchievementsPage: React.FC = () => {
  const { userName } = useAuth();

  const [gamification, setGamification] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamRes, lbRes] = await Promise.allSettled([
          apiClient.get("/gamification/my-progress"),
          apiClient.get("/gamification/leaderboard"),
        ]);

        if (gamRes.status === "fulfilled") {
          setGamification(gamRes.value.data);
        }
        if (lbRes.status === "fulfilled") {
          setLeaderboard(lbRes.value.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки достижений:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (error) {
    return (
      <div
        style={{ textAlign: "center", color: "var(--danger)", padding: "40px" }}
      >
        <AlertCircle size={40} /> <p>{error}</p>
      </div>
    );
  }

  const currentXp = gamification?.xp || 0;
  const currentLevel = gamification?.level || 1;
  const nextLevelXp = currentLevel * 500;
  const progressPercent = Math.min((currentXp / nextLevelXp) * 100, 100);
  const xpRemaining = Math.max(0, nextLevelXp - currentXp);

  const badges = gamification?.badges || [];
  const earnedCount = badges.filter((b: any) => b.earned).length;
  const totalCount = badges.length;

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h1 className="page-title">Мои достижения</h1>
        <p className="page-subtitle">
          Выполняйте задания, получайте опыт и открывайте награды
        </p>
      </div>

      <div className="achievements-layout">
        <div className="main-column">
          <div className="widget">
            <div className="level-info-header">
              <div className="level-title">
                <span>Текущий ранг</span>
                <h2>Уровень {currentLevel}</h2>
              </div>
              <div className="xp-counter">
                {currentXp} <span>/ {nextLevelXp} XP</span>
              </div>
            </div>

            <div className="xp-progress-wrapper">
              <div className="xp-bar-track">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="xp-hint">
              Осталось {xpRemaining} XP до Уровня {currentLevel + 1}
            </div>
          </div>

          <div className="widget">
            <div className="widget-title">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Trophy size={20} color="var(--nau-orange)" />
                Коллекция бейджей
              </div>
              <div
                className="task-tag"
                style={{ background: "var(--nau-light-gray)" }}
              >
                Собрано {earnedCount} из {totalCount}
              </div>
            </div>

            <div className="achievements-grid">
              {badges.map((badge: any) => {
                const IconComponent = iconMap[badge.icon_url] || Award;
                const isEarned = badge.earned;

                return (
                  <div
                    key={badge.id}
                    className={`achievement-card ${isEarned ? "earned" : "locked"}`}
                  >
                    <div
                      className={`badge-icon ${isEarned ? "gold" : "locked"}`}
                    >
                      {isEarned ? (
                        <IconComponent size={28} />
                      ) : (
                        <Lock size={28} />
                      )}
                    </div>
                    <h4 className="badge-title">{badge.name}</h4>
                    <p className="badge-desc">
                      {isEarned
                        ? `Награда: +${badge.xp_reward} XP`
                        : `Награда: +${badge.xp_reward} XP`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widget-title">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={20} color="var(--nau-dark)" />
              Рейтинг новичков
            </div>
          </div>
          <p className="widget-subtitle" style={{ marginBottom: "16px" }}>
            Топ сотрудников за текущий месяц
          </p>

          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <p className="text-gray text-sm text-center">
                Пока нет данных для рейтинга
              </p>
            ) : (
              leaderboard.map((user, index) => {
                const isCurrentUser = user.name === userName;
                const avatarLetter = user.name
                  ? user.name[0].toUpperCase()
                  : "?";

                return (
                  <div
                    key={user.id}
                    className={`leaderboard-item ${isCurrentUser ? "current-user" : ""}`}
                  >
                    <div className="rank-number">{index + 1}</div>
                    <div
                      className="avatar"
                      style={
                        !isCurrentUser ? { background: "var(--nau-gray)" } : {}
                      }
                    >
                      {avatarLetter}
                    </div>
                    <div className="player-info">
                      <span className="player-name">{user.name}</span>
                      <span className="player-level">
                        Уровень {user.level || 1}
                      </span>
                    </div>
                    <div className="player-xp">
                      {user.xp || 0}{" "}
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--nau-gray)",
                          fontWeight: "normal",
                        }}
                      >
                        XP
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
