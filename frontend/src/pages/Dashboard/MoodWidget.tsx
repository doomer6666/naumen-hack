import React, { useState } from "react";
import {
  Sparkles,
  Smile,
  Meh,
  Frown,
  LifeBuoy,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface Mood {
  id: string;
  icon: React.ElementType;
  label: string;
}

const moods: Mood[] = [
  { id: "excellent", icon: Sparkles, label: "Отлично" },
  { id: "good", icon: Smile, label: "Хорошо" },
  { id: "normal", icon: Meh, label: "Нормально" },
  { id: "unclear", icon: Frown, label: "Не очень" },
  { id: "help", icon: LifeBuoy, label: "Нужна помощь" },
];

export const MoodWidget: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const simulateSubmit = () => {
    setStatus("submitting");
    // Имитация задержки сети
    setTimeout(() => {
      setStatus("success");
    }, 1200);
  };

  const handleMoodClick = (id: string) => {
    if (status === "submitting" || status === "success") return;

    setSelectedMood(id);

    // Если это не "Нужна помощь", отправляем сразу
    if (id !== "help") {
      simulateSubmit();
    }
  };

  const handleHelpSubmit = () => {
    if (!helpText.trim()) return;
    simulateSubmit();
  };

  return (
    <div className="widget">
      <div className="widget-title">
        Оценка настроения
        <span className="widget-subtitle">Еженедельный пульс</span>
      </div>

      {status === "success" ? (
        <div className="mood-success">
          <CheckCircle2 size={48} className="text-success" />
          <h4>Пульс отмечен!</h4>
          <p>Спасибо, хорошего дня</p>
        </div>
      ) : (
        <div className="mood-container">
          <p className="mood-question">
            Насколько понятны текущие задачи и хватает ли доступов?
          </p>
          <div className="mood-buttons">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.id;
              const isSubmittingThis =
                status === "submitting" && isSelected && mood.id !== "help";
              const isDisabled = status === "submitting";

              return (
                <button
                  key={mood.id}
                  className={`mood-btn ${isSelected ? "selected" : ""} ${isDisabled && !isSelected ? "disabled" : ""}`}
                  onClick={() => handleMoodClick(mood.id)}
                  disabled={isDisabled}
                >
                  {isSubmittingThis ? (
                    <Loader2 size={28} className="spinner" />
                  ) : (
                    <mood.icon size={28} />
                  )}
                  <span>{mood.label}</span>
                </button>
              );
            })}
          </div>

          {selectedMood === "help" && (
            <div className="mood-help-form">
              <textarea
                placeholder="Опишите, с чем возникли трудности (нет доступов, непонятна задача и т.д.)..."
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                className="mood-textarea"
                disabled={status === "submitting"}
              />
              <button
                className="nau-btn-primary"
                onClick={handleHelpSubmit}
                disabled={!helpText.trim() || status === "submitting"}
              >
                {status === "submitting" ? (
                  <Loader2 size={18} className="spinner" />
                ) : null}
                {status === "submitting" ? "Отправка..." : "Отправить запрос"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodWidget;
