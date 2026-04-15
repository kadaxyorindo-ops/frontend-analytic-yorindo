import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="rounded-2xl border border-[#D7E1F0] bg-white px-5 py-3 text-sm font-semibold text-[#5B6B7F] shadow-[0_10px_20px_rgba(10,38,71,0.06)]">
          Menyiapkan workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
