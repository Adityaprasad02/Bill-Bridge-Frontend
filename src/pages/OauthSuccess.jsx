import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "@/features/auth/authStore";
import { getMe } from "@/features/auth/authService";
import { Loader2 } from "lucide-react";

export default function OauthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuth = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(errorParam);
        toast.error(errorParam);
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      if (!accessToken) {
        setError("No access token received");
        toast.error("Google login failed — no token received");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      // Remove tokens from URL so they don't stay in browser history
      window.history.replaceState({}, "", window.location.pathname);

      try {
        const store = useAuthStore.getState();
        store.setAccessToken(accessToken);
        if (refreshToken) store.setRefreshToken(refreshToken);

        const user = await getMe();
        store.setUser(user);

        toast.success("Logged in with Google!");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        useAuthStore.getState().clearSession();
        setError("Failed to complete Google login");
        toast.error("Failed to complete Google login");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleOAuth();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-muted-foreground text-xs">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Completing Google sign-in...</span>
      </div>
    </div>
  );
}