//C:\Users\jhon\Downloads\tauroGYM1\app\users\page.tsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Componente de redirección
export default function UsersRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de usuarios en español
    router.push("/usuarios")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirigiendo a la página de usuarios...</p>
    </div>
  )
}
