import React from "react";
import { Target, Handshake, Lock, Sword } from "lucide-react";

interface Badge {
  id: number;
  icon: React.ElementType;
  title: string;
  type: "gold" | "blue" | "locked";
}

const badges: Badge[] = [
  { id: 1, icon: Target, title: "Первый старт", type: "gold" },
  { id: 2, icon: Handshake, title: "Влился в команду", type: "blue" },
  { id: 3, icon: Lock, title: "Мастер Git", type: "locked" },
  { id: 4, icon: Sword, title: "Боевое крещение", type: "locked" },
];

const BadgesWidget: React.FC = () => {
  return (
    <div className="widget">
      <div className="widget-title">
        Ваши достижения
        <a
          href="/achievements"
          style={{
            fontSize: "13px",
            color: "var(--nau-orange)",
            textDecoration: "none",
          }}
        >
          Все бейджи
        </a>
      </div>
      <div className="badges-list">
        {badges.map((badge) => (
          <div key={badge.id} className="badge-item">
            <div className={`badge-icon ${badge.type}`}>
              <badge.icon size={28} />
            </div>
            <span className="badge-title">
              {badge.title.split(" ").map((word, i) => (
                <React.Fragment key={i}>
                  {word}
                  {i < badge.title.split(" ").length - 1 ? <br /> : ""}
                </React.Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesWidget;
