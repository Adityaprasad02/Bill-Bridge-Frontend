import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button.jsx"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // --------------------------
  // Validation
  // --------------------------
  const validate = () => {
    const newErrors = {}

    if (!form.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!form.password) {
      newErrors.password = "Password is required"
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    return newErrors
  }

  // --------------------------
  // Manual Login
  // --------------------------
  const handleSubmit = (e) => {
    e.preventDefault()
    setApiError("")

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setLoading(true)

    const payload = {
      username: form.username,
      password: form.password,
    }

    // Replace this with real API call later
    setTimeout(() => {
      console.log("Login Payload:", payload)

      // Fake failure example
      setApiError("Invalid credentials. Please try again.")
      setLoading(false)
    }, 1500)
  }

  // --------------------------
  // Google Login
  // --------------------------
  const handleGoogleLogin = () => {
    setApiError("")
    setLoading(true)

    setTimeout(() => {
      console.log("Google Login Triggered")
      setLoading(false)
    }, 1500)
  }

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
                            //   onClick={handleGoogleSignup}
                              >
                              <FcGoogle className="mr-2 h-5 w-5" />
                              Sign up with Google
        </Button>

      </div>
    </div>
  )
}