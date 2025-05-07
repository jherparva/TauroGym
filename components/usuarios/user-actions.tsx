"use client"

import type React from "react"

import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useState } from "react"
import { Plus, RefreshCw, Loader2 } from "lucide-react"
import { PagoModal } from "../../components/pagos/pago-modal"
import { WhatsAppBatchNotification } from "../../components/pagos/whatsapp-batch-notification"
import { toast } from "../../components/ui/use-toast"

interface UserActionsProps {
  fetchUsers: () => Promise<void>
  loadingUsers: boolean
  plans: any[]
  onPagoCreado: () => void
}

export function UserActions({ fetchUsers, loadingUsers, plans, onPagoCreado }: UserActionsProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    estado: "activo",
    plan: "",
    fechaInicio: "",
    fechaFin: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      // Si estamos seleccionando un plan, actualizar fechas automáticamente
      if (name === "plan") {
        const planSeleccionado = plans.find((plan) => plan._id === value)
        if (planSeleccionado) {
          const fechaInicio = prev.fechaInicio ? new Date(prev.fechaInicio) : new Date()
          const fechaFin = new Date(fechaInicio)

          if (planSeleccionado.tipoDuracion === "dia") {
            fechaFin.setDate(fechaInicio.getDate() + planSeleccionado.duracion)
          } else if (planSeleccionado.tipoDuracion === "semana") {
            fechaFin.setDate(fechaInicio.getDate() + planSeleccionado.duracion * 7)
          } else if (planSeleccionado.tipoDuracion === "quincena") {
            fechaFin.setDate(fechaInicio.getDate() + planSeleccionado.duracion * 15)
          } else if (planSeleccionado.tipoDuracion === "mes") {
            fechaFin.setMonth(fechaInicio.getMonth() + planSeleccionado.duracion)
          }

          return {
            ...prev,
            [name]: value,
            fechaInicio: fechaInicio.toISOString().split("T")[0],
            fechaFin: fechaFin.toISOString().split("T")[0],
          }
        }
      }

      return { ...prev, [name]: value }
    })
  }

  const resetForm = () => {
    setFormData({
      cedula: "",
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      estado: "activo",
      plan: "",
      fechaInicio: "",
      fechaFin: "",
    })
    setFormError("")
  }

  const handleCreateUser = async () => {
    setFormError("")

    try {
      setIsCreating(true)

      // Crear usuario
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear usuario")
      }

      // Recargar usuarios
      await fetchUsers()

      resetForm()
      setIsCreating(false)

      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      })
    } catch (error: any) {
      setFormError(error.message)
      setIsCreating(false)

      toast({
        title: "Error",
        description: error.message || "Error al crear usuario",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Button variant="outline" onClick={fetchUsers} disabled={loadingUsers} className="gap-2">
        {loadingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        <span className="hidden sm:inline">Actualizar Datos</span>
        <span className="inline sm:hidden">Actualizar</span>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2" onClick={resetForm}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Miembro</span>
            <span className="inline sm:hidden">Nuevo</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Miembro</DialogTitle>
            <DialogDescription>Ingrese los datos del nuevo miembro del gimnasio.</DialogDescription>
          </DialogHeader>
          {formError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{formError}</div>}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  name="cedula"
                  placeholder="V-12345678"
                  value={formData.cedula}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre y Apellido"
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="+58 412-555-1234"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                placeholder="Dirección completa"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan de Membresía</Label>
                <Select value={formData.plan} onValueChange={(value) => handleSelectChange("plan", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans &&
                      plans.map((plan) => (
                        <SelectItem key={plan._id} value={plan._id}>
                          {plan.nombre} - {formatCOP(plan.precio)} - {plan.duracion} {plan.tipoDuracion}(s)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <Input
                  id="fechaFin"
                  name="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PagoModal
        onPagoCreado={onPagoCreado}
        tipo="nuevoPago"
        buttonText="Registrar Pago"
        buttonIcon={<Plus className="h-4 w-4 mr-1" />}
      />

      <WhatsAppBatchNotification />
    </div>
  )
}

// Función auxiliar para formatear moneda
function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
