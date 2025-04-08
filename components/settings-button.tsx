"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsButton({ onClick, boardColors }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2 hover:bg-opacity-10"
      style={{
        borderWidth: "2px",
        borderColor: "var(--dark-square)",
        color: "var(--dark-square)",
        backgroundColor: "transparent",
      }}
    >
      <Settings className="h-5 w-5" />
      <span>Configuración</span>
    </Button>
  )
}
