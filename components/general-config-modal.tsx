"use client"

import type React from "react"
import { formatCurrency } from "../lib/currency"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { toast } from "./ui/use-toast"
import { Loader2, Save, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"

export function GeneralConfigModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Estado para configuración general
  const [config, setConfig] = useState({
    nombreGimnasio: "",
    direccion: "",
    telefono: "",
    email: "",
    moneda: "COP", // Moneda por defecto: Pesos colombianos
    formatoFecha: "",
    zonaHoraria: "",
    logoUrl: "",
    colorPrimario: "",
    colorSecundario: "",
    mostrarLogo: true,
    mostrarNombre: true,
    mostrarContacto: true,
    descripcion: "",
    horaApertura: "",
    horaCierre: "",
    diasOperacion: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setConfig((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleDayToggle = (day: string) => {
    setConfig((prev) => {
      const currentDays = [...prev.diasOperacion]
      if (currentDays.includes(day)) {
        return { ...prev, diasOperacion: currentDays.filter((d) => d !== day) }
      } else {
        return { ...prev, diasOperacion: [...currentDays, day] }
      }
    })
  }

  const loadConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const response = await fetch("/api/config/general")
      if (!response.ok) throw new Error("Error al cargar configuración")

      const data = await response.json()

      // Verificar la estructura de la respuesta y establecer los valores predeterminados si es necesario
      if (data && data.config) {
        setConfig({
          nombreGimnasio: data.config.nombreGimnasio || "",
          direccion: data.config.direccion || "",
          telefono: data.config.telefono || "",
          email: data.config.email || "",
          moneda: data.config.moneda || "COP",
          formatoFecha: data.config.formatoFecha || "DD/MM/YYYY",
          zonaHoraria: data.config.zonaHoraria || "America/Bogota",
          logoUrl: data.config.logoUrl || "",
          colorPrimario: data.config.colorPrimario || "#ff0000",
          colorSecundario: data.config.colorSecundario || "#000000",
          mostrarLogo: data.config.mostrarLogo !== undefined ? data.config.mostrarLogo : true,
          mostrarNombre: data.config.mostrarNombre !== undefined ? data.config.mostrarNombre : true,
          mostrarContacto: data.config.mostrarContacto !== undefined ? data.config.mostrarContacto : true,
          descripcion: data.config.descripcion || "",
          horaApertura: data.config.horaApertura || "06:00",
          horaCierre: data.config.horaCierre || "22:00",
          diasOperacion: Array.isArray(data.config.diasOperacion) ? data.config.diasOperacion : [],
        })
      }

      console.log("Configuración cargada:", data)
    } catch (error) {
      console.error("Error al cargar configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración general",
        variant: "destructive",
      })
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const saveConfig = async () => {
    setIsLoading(true)
    try {
      console.log("Guardando configuración:", config)

      const response = await fetch("/api/config/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar configuración")
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración general se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "No se pudo guardar la configuración",
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

  // Ejemplo de uso de formatCurrency
  const formatearPrecio = (precio: number) => {
    return formatCurrency(precio, config.moneda)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Configuración General
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración General</DialogTitle>
          <DialogDescription>
            Configure los parámetros generales del sistema, como nombre del gimnasio, logo y preferencias.
          </DialogDescription>
        </DialogHeader>

        {isLoadingConfig ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Cargando configuración...</p>
          </div>
        ) : (
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
              <TabsTrigger value="horarios">Horarios</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreGimnasio">Nombre del gimnasio</Label>
                  <Input
                    id="nombreGimnasio"
                    name="nombreGimnasio"
                    value={config.nombreGimnasio}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" value={config.telefono} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" name="email" type="email" value={config.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" name="direccion" value={config.direccion} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select value={config.moneda} onValueChange={handleSelectChange("moneda")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formatoFecha">Formato de fecha</Label>
                  <Select value={config.formatoFecha} onValueChange={handleSelectChange("formatoFecha")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zonaHoraria">Zona horaria</Label>
                  <Select value={config.zonaHoraria} onValueChange={handleSelectChange("zonaHoraria")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="America/Caracas">Caracas (GMT-4)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={config.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="apariencia" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUpload">Logo del gimnasio</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-md border flex items-center justify-center overflow-hidden">
                      <img
                        src={config.logoUrl || "/placeholder-logo.svg"}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <Button variant="outline" className="h-10">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mostrarLogo">Mostrar logo</Label>
                    <Switch
                      id="mostrarLogo"
                      checked={config.mostrarLogo}
                      onCheckedChange={handleSwitchChange("mostrarLogo")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mostrarNombre">Mostrar nombre</Label>
                    <Switch
                      id="mostrarNombre"
                      checked={config.mostrarNombre}
                      onCheckedChange={handleSwitchChange("mostrarNombre")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mostrarContacto">Mostrar información de contacto</Label>
                    <Switch
                      id="mostrarContacto"
                      checked={config.mostrarContacto}
                      onCheckedChange={handleSwitchChange("mostrarContacto")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorPrimario">Color primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorPrimario"
                      name="colorPrimario"
                      value={config.colorPrimario}
                      onChange={handleInputChange}
                    />
                    <input
                      type="color"
                      value={config.colorPrimario}
                      onChange={(e) => setConfig((prev) => ({ ...prev, colorPrimario: e.target.value }))}
                      className="h-10 w-10 rounded-md border p-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorSecundario">Color secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorSecundario"
                      name="colorSecundario"
                      value={config.colorSecundario}
                      onChange={handleInputChange}
                    />
                    <input
                      type="color"
                      value={config.colorSecundario}
                      onChange={(e) => setConfig((prev) => ({ ...prev, colorSecundario: e.target.value }))}
                      className="h-10 w-10 rounded-md border p-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="horarios" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaApertura">Hora de apertura</Label>
                  <Input
                    id="horaApertura"
                    name="horaApertura"
                    type="time"
                    value={config.horaApertura}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaCierre">Hora de cierre</Label>
                  <Input
                    id="horaCierre"
                    name="horaCierre"
                    type="time"
                    value={config.horaCierre}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días de operación</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={config.diasOperacion.includes(day) ? "default" : "outline"}
                      onClick={() => handleDayToggle(day)}
                      className="capitalize"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
