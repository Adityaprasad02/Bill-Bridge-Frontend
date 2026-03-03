import { useState } from 'react'
import './App.css'
import React from 'react'
import { Button } from "@/components/ui/button"
import {Input} from "@/components/ui/input"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
      <Input placeholder="Enter the text"/>
    </div>
  )
}

export default App