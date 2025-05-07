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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export function SystemNotificationsModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [config, setConfig] = useState({
    enabled: false,
    emailNotifications: true,
    dashboardNotifications: true,
    lowInventoryAlert: true,
    lowInventoryThreshold: "10",
    membershipExpiryAlert: true,
    membershipExpiryDays: "7",
    dailyReportEmail: false,
    adminEmails: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setConfig((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setConfig((prev) => ({ ...prev, [name]: checked }))
  }

  const loadConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const response = await fetch("/api/config/system-notifications")
      if (response.ok) {
        const data = await response.json()
        setConfig((prev) => ({
          ...prev,
          ...data,
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
      const response = await fetch("/api/config/system-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la configuración")
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de notificaciones del sistema se ha guardado correctamente",
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
        <Button className="w-full" variant="outline">
          Configurar Notificaciones
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Notificaciones del Sistema</DialogTitle>
          <DialogDescription>
            Configure las notificaciones internas del sistema y las alertas para los administradores.
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
                  Habilitar el sistema de notificaciones internas para administradores
                </p>
              </div>
              <Switch id="notifications" checked={config.enabled} onCheckedChange={handleSwitchChange("enabled")} />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Canales de notificación</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={config.emailNotifications}
                  onCheckedChange={handleCheckboxChange("emailNotifications")}
                />
                <Label htmlFor="emailNotifications">Notificaciones por correo electrónico</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dashboardNotifications"
                  checked={config.dashboardNotifications}
                  onCheckedChange={handleCheckboxChange("dashboardNotifications")}
                />
                <Label htmlFor="dashboardNotifications">Notificaciones en el panel de control</Label>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Tipos de alertas</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowInventoryAlert">Alerta de inventario bajo</Label>
                  <Switch
                    id="lowInventoryAlert"
                    checked={config.lowInventoryAlert}
                    onCheckedChange={handleSwitchChange("lowInventoryAlert")}
                  />
                </div>
                {config.lowInventoryAlert && (
                  <div className="pl-6 pt-2">
                    <Label htmlFor="lowInventoryThreshold" className="text-sm">
                      Umbral de inventario bajo
                    </Label>
                    <Select
                      value={config.lowInventoryThreshold}
                      onValueChange={handleSelectChange("lowInventoryThreshold")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar umbral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 unidades</SelectItem>
                        <SelectItem value="10">10 unidades</SelectItem>
                        <SelectItem value="15">15 unidades</SelectItem>
                        <SelectItem value="20">20 unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="membershipExpiryAlert">Alerta de vencimiento de membresías</Label>
                  <Switch
                    id="membershipExpiryAlert"
                    checked={config.membershipExpiryAlert}
                    onCheckedChange={handleSwitchChange("membershipExpiryAlert")}
                  />
                </div>
                {config.membershipExpiryAlert && (
                  <div className="pl-6 pt-2">
                    <Label htmlFor="membershipExpiryDays" className="text-sm">
                      Días de anticipación
                    </Label>
                    <Select
                      value={config.membershipExpiryDays}
                      onValueChange={handleSelectChange("membershipExpiryDays")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar días" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 días</SelectItem>
                        <SelectItem value="5">5 días</SelectItem>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="10">10 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dailyReportEmail">Informe diario por correo</Label>
                <Switch
                  id="dailyReportEmail"
                  checked={config.dailyReportEmail}
                  onCheckedChange={handleSwitchChange("dailyReportEmail")}
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="adminEmails">Correos de administradores</Label>
              <Input
                id="adminEmails"
                name="adminEmails"
                placeholder="admin@ejemplo.com, gerente@ejemplo.com"
                value={config.adminEmails}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Lista de correos electrónicos separados por comas que recibirán las notificaciones
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
