import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    setRole(role);
    if (role === "hr") navigate("/hr/dashboard");
    else if (role === "mentor") navigate("/mentor/my-mentees");
    else navigate("/dashboard");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--nau-bg)",
      }}
    >
      <div
        className="widget"
        style={{ padding: "40px", width: "400px", textAlign: "center" }}
      >
        <h1 style={{ color: "var(--nau-orange)", marginBottom: "24px" }}>
          NAUMEN
        </h1>
        <p style={{ marginBottom: "24px", color: "var(--nau-gray)" }}>
          Выберите роль для демо-входа
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            className="mood-btn selected"
            onClick={() => handleLogin("newbie")}
          >
            Сотрудник
          </button>
          <button
            className="mood-btn selected"
            onClick={() => handleLogin("hr")}
          >
            HR
          </button>
          <button
            className="mood-btn selected"
            onClick={() => handleLogin("mentor")}
          >
            Наставник
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
