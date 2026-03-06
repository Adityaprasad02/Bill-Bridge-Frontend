import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button.jsx"
import { FcGoogle } from "react-icons/fc"
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser }  from "../features/auth/authService.js"
import useAuthStore  from "../features/auth/authStore.js"

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";


export default function Login() {
  const navigate = useNavigate();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  setApiError("");
  const v = validate();
  setErrors(v);
  if (Object.keys(v).length) return;

  setLoading(true);

  try {
    // 1️⃣ Login
    const loginData = await loginUser({
      username: form.username,
      password: form.password,
    });

    const accessToken = loginData?.accessToken;

    if (!accessToken) {
      throw new Error("Access token missing in login response");
    }

    // 2️⃣ Store tokens
    setAccessToken(loginData.accessToken);
    setRefreshToken(loginData.refreshToken);

    // 3️⃣ Store user from TokenResponse (includes ResponseUserRegistration)
    if (loginData.user) {
      setUser(loginData.user);
    }

    // 4️⃣ Navigate
    navigate("/dashboard", { replace: true });

  } catch (err) {
    setApiError(
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = () => {
    window.location.href = `${backendURL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow-xl p-8 space-y-6">

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

          {/* Username */}
          <div className="space-y-1">
            <input
              type="text"
              name="login_username"
              autoComplete="off"
              placeholder="Username"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="login_password"
              autoComplete="new-password"
              placeholder="Password"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            {/* Toggle Icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div className="relative text-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">
            OR
          </span>
        </div>

        {/* Google Button */}
        <Button
             type="button"
             variant="outline"
              className="w-full"
            onClick={handleGoogleLogin}
                        >
               <FcGoogle className="mr-2 h-5 w-5" />
              Sign in with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
       
      </div>
    </div>
  )
}