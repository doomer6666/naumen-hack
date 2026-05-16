import React from "react";
import {
  Zap,
  Key,
  Calendar,
  Star,
  Lock,
  Trophy,
  Target,
  Flag,
} from "lucide-react";
import "./Achievements.css";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "earned" | "locked";
  styleType: "gold" | "blue" | "locked";
}

interface LeaderboardUser {
  id: string;
  name: string;
  level: number;
  xp: number;
  avatarLetter: string;
  isCurrentUser?: boolean;
}

const USER_CURRENT_XP = 850;
const USER_NEXT_LEVEL_XP = 1000;
const USER_LEVEL = 3;

const achievementsList: Achievement[] = [
  {
    id: "a1",
    title: "Первый таск",
    description: "Успешно закрыта первая задача в Jira",
    icon: <Zap size={28} />,
    status: "earned",
    styleType: "gold",
  },
  {
    id: "a2",
    title: "Мастер доступов",
    description: "Настроены все рабочие инструменты",
    icon: <Key size={28} />,
    status: "earned",
    styleType: "blue",
  },
  {
    id: "a3",
    title: "Неделя в компании",
    description: "Успешно пережита первая рабочая неделя",
    icon: <Calendar size={28} />,
    status: "earned",
    styleType: "gold",
  },
  {
    id: "a4",
    title: "Звезда команды",
    description: "Получить первый лайк от ментора",
    icon: <Star size={28} />,
    status: "earned",
    styleType: "blue",
  },
  {
    id: "a5",
    title: "Месяц с нами",
    description: "Закрыть испытательный срок первого месяца",
    icon: <Flag size={28} />,
    status: "locked",
    styleType: "locked",
  },
  {
    id: "a6",
    title: "Первый релиз",
    description: "Ваш код дошел до продакшена",
    icon: <Lock size={28} />,
    status: "locked",
    styleType: "locked",
  },
];

const leaderboardData: LeaderboardUser[] = [
  { id: "u1", name: "Мария В.", level: 4, xp: 1200, avatarLetter: "М" },
  {
    id: "u2",
    name: "Иван Иванов",
    level: 3,
    xp: 850,
    avatarLetter: "И",
    isCurrentUser: true,
  },
  { id: "u3", name: "Алексей С.", level: 3, xp: 720, avatarLetter: "А" },
  { id: "u4", name: "Елена К.", level: 2, xp: 450, avatarLetter: "Е" },
  { id: "u5", name: "Дмитрий П.", level: 1, xp: 120, avatarLetter: "Д" },
];

export const AchievementsPage: React.FC = () => {
  const progressPercent = Math.min(
    (USER_CURRENT_XP / USER_NEXT_LEVEL_XP) * 100,
    100,
  );

  const earnedCount = achievementsList.filter(
    (a) => a.status === "earned",
  ).length;
  const totalCount = achievementsList.length;

  return (
    <>
      <div className="achievements-container">
        <div className="achievements-header">
          <h1 className="page-title">Мои достижения</h1>
          <p className="page-subtitle">
            Выполняйте задания, получайте опыт и открывайте награды
          </p>
        </div>

        <div className="achievements-layout">
          {/* Левая колонка: Прогресс и Бейджи */}
          <div className="main-column">
            {/* Виджет Уровня */}
            <div className="widget">
              <div className="level-info-header">
                <div className="level-title">
                  <span>Текущий ранг</span>
                  <h2>Уровень {USER_LEVEL}</h2>
                </div>
                <div className="xp-counter">
                  {USER_CURRENT_XP} <span>/ {USER_NEXT_LEVEL_XP} XP</span>
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
                Осталось {USER_NEXT_LEVEL_XP - USER_CURRENT_XP} XP до Уровня{" "}
                {USER_LEVEL + 1}
              </div>
            </div>

            {/* Виджет Бейджей */}
            <div className="widget">
              <div className="widget-title">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
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
                {achievementsList.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`achievement-card ${achievement.status}`}
                  >
                    <div className={`badge-icon ${achievement.styleType}`}>
                      {achievement.icon}
                    </div>
                    <h4 className="badge-title">{achievement.title}</h4>
                    <p className="badge-desc">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка: Лидерборд */}
          <div className="widget">
            <div className="widget-title">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Target size={20} color="var(--nau-dark)" />
                Рейтинг новичков
              </div>
            </div>
            <p className="widget-subtitle" style={{ marginBottom: "16px" }}>
              Топ сотрудников за текущий месяц
            </p>

            <div className="leaderboard-list">
              {leaderboardData
                .sort((a, b) => b.xp - a.xp)
                .map((user, index) => (
                  <div
                    key={user.id}
                    className={`leaderboard-item ${user.isCurrentUser ? "current-user" : ""}`}
                  >
                    <div className="rank-number">{index + 1}</div>
                    <div
                      className="avatar"
                      style={
                        !user.isCurrentUser
                          ? { background: "var(--nau-gray)" }
                          : {}
                      }
                    >
                      {user.avatarLetter}
                    </div>
                    <div className="player-info">
                      <span className="player-name">{user.name}</span>
                      <span className="player-level">Уровень {user.level}</span>
                    </div>
                    <div className="player-xp">
                      {user.xp}{" "}
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
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AchievementsPage;
