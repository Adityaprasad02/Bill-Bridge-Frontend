import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/features/auth/authStore";

export default function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}