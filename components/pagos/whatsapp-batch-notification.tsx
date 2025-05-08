"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"
import { MessageSquare, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

export function WhatsAppBatchNotification() {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    mensajesEnviados?: any[]
    totalEnviados?: number
    errores?: any[]
    totalErrores?: number
  } | null>(null)

  const sendBatchNotifications = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/whatsapp/notify-expiring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al enviar notificaciones")
      }

      const data = await response.json()
      setResult(data)

      toast({
        title: "Notificaciones enviadas",
        description: `Se enviaron ${data.totalEnviados} notificaciones con ${data.totalErrores} errores`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar notificaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          // Resetear el resultado cuando se cierra el modal
          setResult(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 whitespace-nowrap">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Enviar notificaciones masivas</span>
          <span className="inline sm:hidden">Notificaciones</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar notificaciones masivas</DialogTitle>
          <DialogDescription>
            Enviar notificaciones por WhatsApp a todos los miembros con planes próximos a vencer.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="py-4">
            <p className="mb-4">
              Esta acción enviará mensajes de WhatsApp a todos los miembros activos cuyo plan esté próximo a vencer
              según la configuración establecida.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Asegúrese de haber configurado correctamente las credenciales de Twilio y la plantilla de mensaje antes de
              continuar.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="font-medium text-green-700 dark:text-green-300">
                Se enviaron {result.totalEnviados} notificaciones exitosamente
              </p>
            </div>

            {result.totalErrores && result.totalErrores > 0 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="font-medium text-red-700 dark:text-red-300">
                  Ocurrieron {result.totalErrores} errores al enviar notificaciones
                </p>
              </div>
            )}

            {result.mensajesEnviados && result.mensajesEnviados.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Mensajes enviados:</h4>
                <div className="max-h-40 overflow-y-auto text-sm">
                  {result.mensajesEnviados.map((msg, index) => (
                    <div key={index} className="mb-1 pb-1 border-b border-gray-100 dark:border-gray-800">
                      {msg.nombre} ({msg.telefono}) - {msg.diasRestantes} días restantes
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <Button onClick={sendBatchNotifications} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Enviar notificaciones
            </Button>
          ) : (
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
