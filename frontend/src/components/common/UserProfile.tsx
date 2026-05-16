import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const UserProfile: React.FC = () => {
  const { userName, userInitials, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <NavLink
        to="/profile"
        className="user-profile"
        style={{ textDecoration: "none" }}
      >
        <div className="avatar">{userInitials}</div>
        <span className="user-name">{userName}</span>
      </NavLink>

      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--nau-gray)",
          display: "flex",
          alignItems: "center",
        }}
        title="Выйти"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
};

export default UserProfile;
