import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAutoFill = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName === "onAutoFillStart") {
      const target = e.target as HTMLInputElement;
      if (target.id === "email") setEmail(target.value);
      if (target.id === "password") setPassword(target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith("@naumen.ru")) {
      setError("Допустима только почта домена @naumen.ru");
      return;
    }
    
    setError("");
    setIsSubmitting(true);

    try {
      const role = await login(email, password);
      
      if (role === "hr") navigate("/hr/dashboard");
      else if (role === "mentor") navigate("/mentor/my-mentees");
      else navigate("/dashboard");
      
    } catch {
      setError("Неверная почта или пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="widget login-card">
        <img src="/logo.png" alt="NAUMEN" className="login-logo" />
        <p className="login-subtitle">Система адаптации персонала</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-group">
            <input
              type="email"
              id="email"
              className={`login-input ${error ? "error" : ""}`}
              placeholder=" "
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onAnimationStart={handleAutoFill}
              autoComplete="email"
              disabled={isSubmitting}
            />
            <label htmlFor="email" className="login-label">Почта</label>
            {error && <span className="input-error-text">{error}</span>}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="login-input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onAnimationStart={handleAutoFill}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <label htmlFor="password" className="login-label">Пароль</label>
            
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="login-btn primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 size={18} className="spin-icon" />
            ) : (
              <LogIn size={18} />
            )}
            {isSubmitting ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="login-divider">
          <span>или</span>
        </div>

        <button 
          type="button" 
          className="login-btn secondary" 
          onClick={() => {}} 
          disabled={isSubmitting}
        >
          <Shield size={18} />
          Войти через внешний сервис NAUMEN
        </button>
      </div>
    </div>
  );
};

export default LoginPage;