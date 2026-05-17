import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Smile,
  Meh,
  Frown,
  LifeBuoy,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import apiClient from "../../api/client";

interface Mood {
  id: string;
  icon: React.ElementType;
  label: string;
  score: number;
}

const moods: Mood[] = [
  { id: "excellent", icon: Sparkles, label: "Отлично", score: 10 },
  { id: "good", icon: Smile, label: "Хорошо", score: 8 },
  { id: "normal", icon: Meh, label: "Нормально", score: 5 },
  { id: "unclear", icon: Frown, label: "Не очень", score: 3 },
  { id: "help", icon: LifeBuoy, label: "Нужна помощь", score: 1 },
];

export const MoodWidget: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string>("");
  const [status, setStatus] = useState<
    "loading" | "idle" | "submitting" | "success" | "error"
  >("loading");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiClient.get("/feedback/next");
        if (res.data.submitted) {
          setStatus("success");
        } else {
          setStatus("idle");
        }
      } catch {
        setStatus("idle");
      }
    };
    checkStatus();
  }, []);

  const submitFeedback = async (moodScore: number, blockers: string = "") => {
    setStatus("submitting");
    try {
      await apiClient.post("/feedback/submit", {
        mood_score: moodScore,
        clarity_score: moodScore >= 5 ? 5 : 2,
        has_access: moodScore > 3,
        blockers: blockers,
      });
      setStatus("success");
    } catch (error) {
      console.error("Ошибка отправки пульса:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const handleMoodClick = (mood: Mood) => {
    if (status === "submitting" || status === "success") return;
    setSelectedMood(mood.id);
    if (mood.id !== "help") {
      submitFeedback(mood.score);
    }
  };

  const handleHelpSubmit = () => {
    if (!helpText.trim()) return;
    const mood = moods.find((m) => m.id === "help");
    submitFeedback(mood!.score, helpText);
  };

  if (status === "loading") {
    return (
      <div
        className="widget"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="widget">
        <div className="widget-title">
          Оценка настроения
          <span className="widget-subtitle">Еженедельный пульс</span>
        </div>
        <div className="mood-success">
          <CheckCircle2 size={48} style={{ color: "var(--success)" }} />
          <h4>Пульс отмечен!</h4>
          <p>Спасибо за обратную связь. До следующей недели!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-title">
        Оценка настроения
        <span className="widget-subtitle">Еженедельный пульс</span>
      </div>
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
                onClick={() => handleMoodClick(mood)}
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

        {status === "error" && (
          <p
            style={{
              color: "var(--danger)",
              marginTop: "12px",
              fontSize: "14px",
            }}
          >
            Ошибка отправки. Попробуйте позже.
          </p>
        )}

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
    </div>
  );
};

export default MoodWidget;
