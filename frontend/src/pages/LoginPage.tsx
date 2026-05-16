import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const role = await login(email, password);

      if (role === "hr") {
        navigate("/hr/dashboard");
      } else if (role === "mentor") {
        navigate("/mentor/my-mentees");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Неверный email или пароль");
    }
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
      <div className="widget" style={{ padding: "40px", width: "400px" }}>
        <h1
          style={{
            color: "var(--nau-orange)",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          NAUMEN
        </h1>

        {error && (
          <p
            style={{
              color: "var(--danger)",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--nau-border)",
              fontSize: "14px",
            }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--nau-border)",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            className="mood-btn selected"
            style={{ padding: "12px" }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
