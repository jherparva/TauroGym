"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { toast } from "../../components/ui/use-toast"
import { MessageSquare, Loader2 } from "lucide-react"

interface WhatsAppNotificationButtonProps {
  userId: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WhatsAppNotificationButton({
  userId,
  variant = "ghost",
  size = "sm",
  className = "h-8 w-8 p-0 text-green-600",
}: WhatsAppNotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const sendWhatsAppNotification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al enviar notificación")
      }

      toast({
        title: "Notificación enviada",
        description: "Se ha enviado un mensaje de WhatsApp al usuario",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar notificación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={sendWhatsAppNotification}
      disabled={isLoading}
      title="Enviar notificación WhatsApp"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
      <span className="sr-only">Enviar WhatsApp</span>
    </Button>
  )
}
