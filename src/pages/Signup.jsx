import { useState } from "react"
import { Button } from "@/components/ui/Button.jsx"
import { Input } from "@/components/ui/Input.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

export default function Signup() {
  const [role, setRole] = useState("CUSTOMER")
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const createPayload = (provider = "LOCAL") => ({
    username: form.username,
    email: form.email,
    password: form.password,
    role,
    authProvider: provider,
  })

  const validate = () => {
    const newErrors = {}

    if (!form.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email"
    }

    if (!form.password) {
      newErrors.password = "Password is required"
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    const payload = createPayload("LOCAL")

    setTimeout(() => {
      console.log("Signup Payload:", payload)
      setIsSubmitting(false)
    }, 1500)
  }

  const handleGoogleSignup = () => {
    if (role !== "CUSTOMER") return

    setIsGoogleLoading(true)

    const payload = createPayload("GOOGLE")

    setTimeout(() => {
      console.log("Google Signup Payload:", payload)
      setIsGoogleLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <Tabs value={role} onValueChange={setRole}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="CUSTOMER">Customer</TabsTrigger>
              <TabsTrigger value="MERCHANT">Merchant</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

            <div>
              <Input
                name="signup_username"
                autoComplete="off"
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
              {errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <Input
                type="email"
                name="signup_email"
                autoComplete="off"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                name="signup_password"
                autoComplete="new-password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isGoogleLoading}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Processing..." : "Sign Up"}
            </Button>
     
            {role === "CUSTOMER" && (
              <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignup}
                    >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Sign up with Google
              </Button>
            )}

          </form>

        </CardContent>
      </Card>
    </div>
  )
}