import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login.jsx"
import Signup from "@/pages/Signup.jsx"
import RootLayout from "@/layouts/RootLayout.jsx"
import Dashboard from "@/pages/Dashboard.jsx"
import RequireAuth from "./features/auth/RequireAuth.jsx"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
        <Route path="/" element={<RootLayout />}>
        <Route index element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
       </Route>  
    </Routes>
  </BrowserRouter>,
)
