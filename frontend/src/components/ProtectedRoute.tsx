import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

// Вспомогательная функция для определения стартовой страницы роли
const getHomePath = (role: UserRole): string => {
  switch (role) {
    case "hr":
      return "/hr/dashboard";
    case "mentor":
      return "/mentor/my-mentees";
    case "newbie":
    default:
      return "/dashboard";
  }
};

// Компонент для защиты маршрутов (требует авторизацию и определенную роль)
export const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  // Ждем, пока AuthProvider проверит токен и загрузит данные пользователя
  if (isLoading) {
    return <div>Loading...</div>; // Здесь можно вставить красивый спиннер
  }

  // Если не авторизован — кидаем на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован, но роль не подходит — кидаем на его главную страницу
  if (!allowedRoles.includes(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  // Если всё ок, рендерим дочерние маршруты
  return <Outlet />;
};

// Компонент для публичных маршрутов (страница логина)
// Если пользователь уже залогинен, его не должно пускать на /login
export const PublicRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Если уже авторизован — отправляем на его дашборд
  if (isAuthenticated) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  return <Outlet />;
};