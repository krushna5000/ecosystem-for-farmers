import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated === null) {
    // Auth status still loading
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in → redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Authenticated → render children
  return children;
};

export default ProtectedRoute;
