import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking token?
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  // After checking: no user → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
