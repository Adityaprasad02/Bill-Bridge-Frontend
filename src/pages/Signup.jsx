import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { toast } from 'react-toastify';
import {signUpUser} from "../features/auth/authService.js"
import { Link } from "react-router-dom"
import { useEffect } from "react"

const backendURL = import.meta.env.VITE_API_BASE_URL  || "http://localhost:8000" ; 

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    const payload = createPayload("LOCAL")


    try{
        const data = await signUpUser(payload)
        console.log("Signup Success:", data)
        toast.success("Account created successfully! Please log in.")
        setForm({ username: "", email: "", password: "" })
    }catch(error){ 
          
        console.error("error received while signup : " , error)
        const errorMessage =
          error.response?.data?.error || "Signup failed ❌" ; 

          toast.error(errorMessage)
    }finally {
     setIsSubmitting(false)
    }

  }

  const handleGoogleSignup = () => {
    if (role !== "CUSTOMER") return

    setIsGoogleLoading(true)

    window.location.href = `${backendURL}/oauth2/authorization/google`
  }
    useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const error = params.get("error")
    const success = params.get("success")

    if (error) {
      toast.error(error) ; 
      setIsGoogleLoading(false)
    }

    if (success) {
      toast.success(success) ;
      setIsGoogleLoading(false)
    }
  }, [])

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

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

        </CardContent>
      </Card>
    </div>
  )
}