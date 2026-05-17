import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  Loader2,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import apiClient from "../../api/client";
import "./FeedbackPage.css";

const moods = [
  { id: "excellent", icon: Sparkles, label: "Отлично", score: 10, color: "var(--success)", bg: "#e6f9f0", border: "var(--success)" },
  { id: "good", icon: Smile, label: "Хорошо", score: 8, color: "var(--success)", bg: "#e6f9f0", border: "var(--success)" },
  { id: "normal", icon: Meh, label: "Нормально", score: 5, color: "var(--nau-orange)", bg: "var(--nau-orange-light)", border: "var(--nau-orange)" },
  { id: "unclear", icon: Frown, label: "Не очень", score: 3, color: "var(--danger)", bg: "#fde8e8", border: "var(--danger)" },
  { id: "help", icon: LifeBuoy, label: "Нужна помощь", score: 1, color: "var(--danger)", bg: "#fde8e8", border: "var(--danger)" },
];

const getClarityEmoji = (score: number) => {
  if (score >= 7) return <Smile size={36} style={{ color: "var(--success)" }} />;
  if (score >= 4) return <Meh size={36} style={{ color: "var(--nau-orange)" }} />;
  return <Frown size={36} style={{ color: "var(--danger)" }} />;
};

export const FeedbackPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState<number>(0);
  
  const [clarityScore, setClarityScore] = useState(7);
  const [hasAccess, setHasAccess] = useState(true);
  const [blockers, setBlockers] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleMoodClick = (mood: typeof moods[0]) => {
    setSelectedMood(mood.id);
    setMoodScore(mood.score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.post("/feedback", {
        mood_score: moodScore,
        clarity_score: clarityScore,
        has_access: hasAccess,
        blockers: blockers,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Ошибка отправки фидбека:", error);
      alert("Не удалось отправить ответы. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="feedback-container">
        <div className="widget">
          <div className="mood-success">
            <CheckCircle2 size={48} style={{ color: "var(--success)" }} />
            <h4>Пульс отмечен!</h4>
            <p>Спасибо за обратную связь. До следующей недели!</p>
          </div>
        </div>
      </div>
    );
  }

  const sliderPercent = ((clarityScore - 1) / 9) * 100;

  return (
    <div className="feedback-container">
      <div className="widget">
        <div className="widget-title">
          Еженедельный пульс
          <span className="widget-subtitle">Помогите нам стать лучше</span>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="fb-section">
            <h3 className="fb-question">Как вы себя чувствуете?</h3>
            <div className="fb-mood-buttons">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    className={`fb-mood-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleMoodClick(mood)}
                    style={isSelected ? { 
                      borderColor: mood.border, 
                      background: mood.bg, 
                      color: mood.color 
                    } : {}}
                  >
                    <mood.icon size={28} />
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fb-section">
            <h3 className="fb-question">Насколько всё понятно?</h3>
            <div className="fb-clarity-row">
              <div className="fb-clarity-icon">
                {getClarityEmoji(clarityScore)}
                <span className="fb-clarity-value">{clarityScore}/10</span>
              </div>
              <div className="fb-slider-wrapper">
                <span className="fb-slider-label">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={clarityScore}
                  onChange={(e) => setClarityScore(Number(e.target.value))}
                  className="fb-slider"
                  style={{
                    background: `linear-gradient(to right, var(--nau-orange) ${sliderPercent}%, var(--nau-light-gray) ${sliderPercent}%)`
                  }}
                />
                <span className="fb-slider-label">10</span>
              </div>
            </div>
          </div>

          <div className="fb-section">
            <div className="fb-toggle-row" onClick={() => setHasAccess(!hasAccess)}>
              <h3 className="fb-question" style={{ margin: 0 }}>Есть ли нужные доступы?</h3>
              <div className={`fb-toggle ${hasAccess ? "active" : ""}`}>
                <div className="fb-toggle-thumb" />
              </div>
            </div>
            <span className="fb-toggle-hint">
              {hasAccess ? "Да, всё под рукой" : "Не хватает доступов"}
            </span>
          </div>

          <div className="fb-section">
            <h3 className="fb-question">Что мешает работать?</h3>
            <textarea
              className="fb-textarea"
              placeholder="Например: не дают доступы к Jira, непонятно, кто мой наставник..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="nau-btn-primary fb-submit"
            disabled={isSubmitting || !selectedMood}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="spinner" />
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? "Отправляем..." : "Отправить ответы"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;