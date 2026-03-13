import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath, type UserRole } from "@/lib/auth";

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <p className="text-sm text-muted-foreground">Loading your account...</p>
  </div>
);

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user.onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
