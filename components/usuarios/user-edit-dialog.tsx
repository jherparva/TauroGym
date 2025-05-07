"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "../../components/ui/use-toast"
import { formatCOP } from "../../lib/currency"

interface UsuarioConPago {
  _id: string
  cedula: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  fechaNacimiento?: Date
  estado: "activo" | "inactivo"
  plan?: {
    _id: string
    nombre: string
    precio: number
    duracion: number
    tipoDuracion: string
  }
  fechaInicio?: Date
  fechaFin?: Date
  montoPagado: number
  createdAt?: Date
  updatedAt?: Date
  infoPago?: {
    montoPagado: number
    saldoPendiente: number
    porcentajePago: number
  }
}

interface UserEditDialogProps {
  currentUser: UsuarioConPago | null
  setCurrentUser: (user: UsuarioConPago | null) => void
  formData: {
    cedula: string
    nombre: string
    email: string
    telefono: string
    direccion: string
    estado: string
    plan: string
    fechaInicio: string
    fechaFin: string
  }
  setFormData: (data: any) => void
  plans: any[]
  fetchUsers: () => Promise<void>
}

export function UserEditDialog({
  currentUser,
  setCurrentUser,
  formData,
  setFormData,
  plans,
  fetchUsers,
}: UserEditDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formError, setFormError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => {
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

  const handleEditUser = async () => {
    if (!currentUser) return

    setFormError("")

    try {
      setIsEditing(true)

      // Actualizar usuario
      const response = await fetch(`/api/usuarios/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar usuario")
      }

      // Recargar usuarios
      await fetchUsers()

      setCurrentUser(null)
      setIsEditing(false)

      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      })
    } catch (error: any) {
      setFormError(error.message)
      setIsEditing(false)

      toast({
        title: "Error",
        description: error.message || "Error al actualizar usuario",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={!!currentUser} onOpenChange={(open) => !open && setCurrentUser(null)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Miembro</DialogTitle>
          <DialogDescription>Actualice los datos del miembro del gimnasio.</DialogDescription>
        </DialogHeader>
        {formError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{formError}</div>}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cedula">Cédula</Label>
              <Input
                id="edit-cedula"
                name="cedula"
                placeholder="V-12345678"
                value={formData.cedula}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre Completo</Label>
              <Input
                id="edit-nombre"
                name="nombre"
                placeholder="Nombre y Apellido"
                value={formData.nombre}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                name="telefono"
                placeholder="+58 412-555-1234"
                value={formData.telefono}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-direccion">Dirección</Label>
            <Input
              id="edit-direccion"
              name="direccion"
              placeholder="Dirección completa"
              value={formData.direccion}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
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
              <Label htmlFor="edit-plan">Plan de Membresía</Label>
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
              <Label htmlFor="edit-fechaInicio">Fecha de Inicio</Label>
              <Input
                id="edit-fechaInicio"
                name="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fechaFin">Fecha de Fin</Label>
              <Input
                id="edit-fechaFin"
                name="fechaFin"
                type="date"
                value={formData.fechaFin}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setCurrentUser(null)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleEditUser} disabled={isEditing}>
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando
              </>
            ) : (
              "Actualizar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
