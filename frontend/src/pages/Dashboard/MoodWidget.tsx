import React, { useState } from "react";
import { Sparkles, Smile, Meh, Frown, LifeBuoy } from "lucide-react";

interface Mood {
  id: string;
  icon: React.ElementType;
  label: string;
}

const moods: Mood[] = [
  { id: "excellent", icon: Sparkles, label: "Отлично" },
  { id: "good", icon: Smile, label: "Хорошо" },
  { id: "normal", icon: Meh, label: "Нормально" },
  { id: "unclear", icon: Frown, label: "Есть вопросы" },
  { id: "help", icon: LifeBuoy, label: "Нужна помощь" },
];

const MoodWidget: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>("good");

  return (
    <div className="widget">
      <div className="widget-title">
        Как ваше настроение?
        <span className="widget-subtitle">Еженедельный пульс</span>
      </div>
      <div className="mood-container">
        <p className="mood-question">
          Оцените, насколько понятны текущие задачи и хватает ли вам доступов
          для работы?
        </p>
        <div className="mood-buttons">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-btn ${selectedMood === mood.id ? "selected" : ""}`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <mood.icon size={28} />
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodWidget;
