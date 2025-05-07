"use client"

import { Avatar } from "@/components/ui/avatar"

interface UserInfoProps {
  collapsed?: boolean
}

export function UserInfo({ collapsed = false }: UserInfoProps) {
  // Simulación de datos de usuario
  const user = {
    name: "Admin",
    email: "admin@taurogym.com",
    role: "Administrador",
  }

  if (collapsed) {
    return (
      <Avatar className="h-10 w-10">
        <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
          {user.name.charAt(0)}
        </div>
      </Avatar>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
          {user.name.charAt(0)}
        </div>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.role}</p>
      </div>
    </div>
  )
}
