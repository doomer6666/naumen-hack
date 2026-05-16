import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Building2,
  MessageSquare,
  BarChart2,
  FileText,
  Users,
  Plug,
  Settings,
  UserCheck,
  Trophy,
} from "lucide-react";
import UserProfile from "./UserProfile";
import { useAuth, type UserRole } from "../../context/AuthContext";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const navPools: Record<UserRole, NavItem[]> = {
  newbie: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Дашборд" },
    { path: "/plan", icon: Map, label: "План пути" },
    { path: "/directory", icon: Building2, label: "Справочник" },
    { path: "/feedback", icon: MessageSquare, label: "Обратная связь" },
    { path: "/achievements", icon: Trophy, label: "Достижения" },
  ],
  hr: [
    { path: "/hr/dashboard", icon: BarChart2, label: "Аналитика" },
    { path: "/hr/templates", icon: FileText, label: "Шаблоны" },
    { path: "/hr/employees", icon: Users, label: "Сотрудники" },
    { path: "/hr/feedbacks", icon: MessageSquare, label: "Обратная связь" },
    { path: "/hr/integrations", icon: Plug, label: "Интеграции" },
    { path: "/hr/settings", icon: Settings, label: "Настройки" },
  ],
  mentor: [
    { path: "/mentor/my-mentees", icon: UserCheck, label: "Мои подопечные" },
    { path: "/directory", icon: Building2, label: "Справочник" },
  ],
};

const TopBar: React.FC = () => {
  const { role, userName, userInitials } = useAuth();
  const currentNav = navPools[role] || [];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-container">
          <a href="#" className="nau-logo">
            <img src="/logo.png" alt="NAUMEN Logo" className="nau-logo-img" />
          </a>
          <span className="nau-logo-sub">Адаптация</span>
        </div>
        <nav className="topbar-nav">
          {currentNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/hr/dashboard" || item.path === "/dashboard"}
              className={({ isActive }: { isActive: boolean }) =>
                `topbar-item ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <UserProfile name={userName} initials={userInitials} />
    </header>
  );
};

export default TopBar;
