import React from "react";
import { useLocation } from "react-router-dom";

const PlaceholderPage: React.FC = () => {
  const location = useLocation();

  const formatTitle = (path: string) => {
    return path
      .replace(/^\//, "")
      .split("/")
      .map(
        (part) =>
          part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      )
      .join(" / ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1 className="page-title">{formatTitle(location.pathname)}</h1>
      <div
        className="widget"
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--nau-gray)",
        }}
      >
        <p>Страница в разработке</p>
        <p style={{ fontSize: "13px", marginTop: "8px" }}>
          Маршрут: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
