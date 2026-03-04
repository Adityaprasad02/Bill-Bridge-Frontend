import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login.jsx"
import Signup from "@/pages/Signup.jsx"
import RootLayout from "@/layouts/RootLayout.jsx"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
        <Route path="/" element={<RootLayout />}>
        <Route index element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
       </Route>  
    </Routes>
  </BrowserRouter>,
)
