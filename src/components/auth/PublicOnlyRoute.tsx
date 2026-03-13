import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getPostAuthPath } from "@/lib/auth";

const PublicOnlyRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Preparing your account...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getPostAuthPath(user)} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
