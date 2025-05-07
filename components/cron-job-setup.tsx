"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Play, Save } from "lucide-react"

export function CronJobSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState({
    enabled: false,
    schedule: "0 9 * * *", // Por defecto, todos los días a las 9 AM
    endpoint: "https://yourdomain.com/api/whatsapp/notify-expiring",
    apiKey: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, enabled: checked }))
  }

  const handleSelectChange = (value: string) => {
    setConfig((prev) => ({ ...prev, schedule: value }))
  }

  const saveConfig = async () => {
    setIsLoading(true)
    try {
      // Aquí iría la lógica para guardar la configuración del cron job
      // Esto podría ser a través de un servicio externo como cron-job.org o similar

      toast({
        title: "Configuración guardada",
        description: "La programación de tareas se ha configurado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runManually = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/whatsapp/notify-expiring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al ejecutar la tarea")
      }

      const data = await response.json()

      toast({
        title: "Tarea ejecutada",
        description: `Se enviaron ${data.totalEnviados} notificaciones con ${data.totalErrores} errores`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo ejecutar la tarea",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Programación de Notificaciones</CardTitle>
        <CardDescription>
          Configure cuándo se enviarán automáticamente las notificaciones de WhatsApp a los miembros con planes por
          vencer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="cronEnabled">Activar programación</Label>
            <p className="text-sm text-muted-foreground">
              Ejecutar automáticamente el envío de notificaciones según la programación
            </p>
          </div>
          <Switch id="cronEnabled" checked={config.enabled} onCheckedChange={handleSwitchChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule">Programación (Cron)</Label>
          <Select value={config.schedule} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar programación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0 9 * * *">Diariamente a las 9:00 AM</SelectItem>
              <SelectItem value="0 9 * * 1-5">Lunes a Viernes a las 9:00 AM</SelectItem>
              <SelectItem value="0 9 * * 1,4">Lunes y Jueves a las 9:00 AM</SelectItem>
              <SelectItem value="0 9 1 * *">El primer día de cada mes a las 9:00 AM</SelectItem>
              <SelectItem value="0 */6 * * *">Cada 6 horas</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Seleccione cuándo se ejecutará automáticamente el envío de notificaciones
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endpoint">URL del Endpoint</Label>
          <Input id="endpoint" name="endpoint" value={config.endpoint} onChange={handleInputChange} />
          <p className="text-xs text-muted-foreground">
            URL que será llamada por el servicio de cron para ejecutar las notificaciones
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key (opcional)</Label>
          <Input id="apiKey" name="apiKey" type="password" value={config.apiKey} onChange={handleInputChange} />
          <p className="text-xs text-muted-foreground">
            Clave de API para autenticar las llamadas al endpoint (si es necesario)
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={runManually} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Ejecutar ahora manualmente
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Ejecute manualmente el proceso de envío de notificaciones a todos los miembros con planes por vencer
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveConfig} disabled={isLoading} className="ml-auto">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar configuración
        </Button>
      </CardFooter>
    </Card>
  )
}
