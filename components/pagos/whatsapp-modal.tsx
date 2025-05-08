"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "../ui/use-toast"
import { Loader2, MessageSquare, Save } from "lucide-react"

export function WhatsAppModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [config, setConfig] = useState({
    enabled: false,
    accountSid: "",
    authToken: "",
    fromNumber: "",
    porcentajeAlerta: "90",
    mensajeTemplate:
      "Hola {nombre}, tu plan en TauroGYM está por vencer. Te quedan {diasRestantes} días. ¡Renueva pronto para seguir disfrutando de nuestros servicios!",
    enviarPrueba: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, enabled: checked }))
  }

  const handleSelectChange = (value: string) => {
    setConfig((prev) => ({ ...prev, porcentajeAlerta: value }))
  }

  const loadConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const response = await fetch("/api/config/whatsapp")
      if (response.ok) {
        const data = await response.json()
        setConfig((prev) => ({
          ...prev,
          ...data,
          // Mantener el campo de prueba separado
          enviarPrueba: prev.enviarPrueba,
        }))
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const saveConfig = async () => {
    setIsLoading(true)
    try {
      // Guardar configuración en la base de datos
      const response = await fetch("/api/config/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: config.enabled,
          accountSid: config.accountSid,
          authToken: config.authToken,
          fromNumber: config.fromNumber,
          porcentajeAlerta: config.porcentajeAlerta,
          mensajeTemplate: config.mensajeTemplate,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la configuración")
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de WhatsApp se ha guardado correctamente",
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

  const sendTestMessage = async () => {
    if (!config.enviarPrueba) {
      toast({
        title: "Error",
        description: "Ingrese un número de teléfono para la prueba",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Enviar mensaje de prueba
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: config.enviarPrueba,
          accountSid: config.accountSid,
          authToken: config.authToken,
          fromNumber: config.fromNumber,
          message: config.mensajeTemplate.replace("{nombre}", "Usuario").replace("{diasRestantes}", "3"),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar mensaje de prueba")
      }

      toast({
        title: "Mensaje enviado",
        description: "El mensaje de prueba se ha enviado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje de prueba",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar configuración al abrir el modal
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      loadConfig()
    }
  }

  // También cargar la configuración al montar el componente
  useEffect(() => {
    if (open) {
      loadConfig()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 whitespace-nowrap">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Configurar WhatsApp</span>
          <span className="inline sm:hidden">WhatsApp</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Notificaciones WhatsApp</DialogTitle>
          <DialogDescription>
            Configure las notificaciones automáticas por WhatsApp para alertar a los miembros cuando sus planes estén
            por vencer.
          </DialogDescription>
        </DialogHeader>

        {isLoadingConfig ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Cargando configuración...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Activar notificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar mensajes automáticos a los miembros cuando sus planes estén por vencer
                </p>
              </div>
              <Switch id="notifications" checked={config.enabled} onCheckedChange={handleSwitchChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountSid">Twilio Account SID</Label>
              <Input
                id="accountSid"
                name="accountSid"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.accountSid}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">Encuentre su Account SID en el panel de control de Twilio</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authToken">Twilio Auth Token</Label>
              <Input
                id="authToken"
                name="authToken"
                type="password"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.authToken}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">Encuentre su Auth Token en el panel de control de Twilio</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromNumber">Número de WhatsApp de Twilio</Label>
              <Input
                id="fromNumber"
                name="fromNumber"
                placeholder="+14155238886"
                value={config.fromNumber}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                El número de WhatsApp desde el que se enviarán los mensajes (formato: +14155238886)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentajeAlerta">Porcentaje para enviar alerta</Label>
              <Select value={config.porcentajeAlerta} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar porcentaje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80% del plan completado</SelectItem>
                  <SelectItem value="85">85% del plan completado</SelectItem>
                  <SelectItem value="90">90% del plan completado</SelectItem>
                  <SelectItem value="95">95% del plan completado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Enviar notificación cuando el plan haya alcanzado este porcentaje de días transcurridos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensajeTemplate">Plantilla de mensaje</Label>
              <Textarea
                id="mensajeTemplate"
                name="mensajeTemplate"
                placeholder="Hola {nombre}, tu plan está por vencer..."
                value={config.mensajeTemplate}
                onChange={handleInputChange}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{nombre}"} para incluir el nombre del miembro y {"{diasRestantes}"} para los días restantes
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="enviarPrueba">Enviar mensaje de prueba</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="enviarPrueba"
                  name="enviarPrueba"
                  placeholder="+584121234567"
                  value={config.enviarPrueba}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button onClick={sendTestMessage} disabled={isLoading} className="whitespace-nowrap">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Enviar prueba
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingrese un número de teléfono con código de país para enviar un mensaje de prueba
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={saveConfig} disabled={isLoading || isLoadingConfig}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
