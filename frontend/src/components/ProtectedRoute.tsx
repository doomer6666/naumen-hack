import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

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

export const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  return <Outlet />;
};

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  return <Outlet />;
};