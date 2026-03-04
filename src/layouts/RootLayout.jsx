import React from 'react'
import Navbar from '@/components/layout/Navbar.jsx'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';

function RootLayout() {
  return (
    <div>
        <ToastContainer theme="colored"/>
        <Navbar />
        <Outlet />
    </div>
  )
}

export default RootLayout