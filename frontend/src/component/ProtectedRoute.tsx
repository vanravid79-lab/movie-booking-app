import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem("cambo_token");
  const userStr = localStorage.getItem("cambo_user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (requiredRole && user.role !== requiredRole) {
      // Not authorized for this role
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    localStorage.removeItem("cambo_token");
    localStorage.removeItem("cambo_user");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
