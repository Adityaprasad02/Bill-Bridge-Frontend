import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/features/auth/authStore";

export default function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, [hydrated]);

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}