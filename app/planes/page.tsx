"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { formatCOP } from "@/lib/currency"

// Definir interfaz para el tipo de Plan
interface Plan {
  _id: string
  nombre: string
  descripcion: string
  precio: number
  duracion: number
  beneficios: string[]
  estado: "activo" | "inactivo"
}

export default function PlanesPage() {
  const router = useRouter()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    duracion: 30,
    beneficios: "",
    estado: "activo",
  })

  // Cargar planes al iniciar
  useEffect(() => {
    fetchPlanes()
  }, [])

  const fetchPlanes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/planes")
      if (!response.ok) throw new Error("Error al cargar planes")

      const data = await response.json()
      setPlanes(data.planes)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "precio" ? Number.parseFloat(value) : value,
    })
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      duracion: 30,
      beneficios: "",
      estado: "activo",
    })
  }

  const prepareEditForm = (plan: Plan) => {
    setCurrentPlan(plan)
    setFormData({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio,
      duracion: plan.duracion,
      beneficios: plan.beneficios.join("\n"),
      estado: plan.estado,
    })
    setOpenEditDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const beneficiosArray = formData.beneficios
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "")

      const planData = {
        ...formData,
        beneficios: beneficiosArray,
        precio: Number(formData.precio),
        duracion: Number(formData.duracion),
      }

      const response = await fetch("/api/planes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      })

      if (!response.ok) throw new Error("Error al crear plan")

      toast({
        title: "Éxito",
        description: "Plan creado correctamente",
      })

      fetchPlanes()
      setOpenDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el plan",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPlan) return

    try {
      const beneficiosArray = formData.beneficios
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "")

      const planData = {
        ...formData,
        beneficios: beneficiosArray,
        precio: Number(formData.precio),
        duracion: Number(formData.duracion),
      }

      const response = await fetch(`/api/planes/${currentPlan._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      })

      if (!response.ok) throw new Error("Error al actualizar plan")

      toast({
        title: "Éxito",
        description: "Plan actualizado correctamente",
      })

      fetchPlanes()
      setOpenEditDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!currentPlan) return

    try {
      const response = await fetch(`/api/planes/${currentPlan._id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar plan")

      toast({
        title: "Éxito",
        description: "Plan eliminado correctamente",
      })

      fetchPlanes()
      setOpenDeleteDialog(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Planes de Membresía</h1>
          <p className="text-muted-foreground">Gestiona los planes de membresía y precios del gimnasio</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Crear Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Plan de Membresía</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="precio">Precio (COP)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="1000"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="duracion">Duración (días)</Label>
                <Input
                  id="duracion"
                  name="duracion"
                  type="number"
                  value={formData.duracion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="beneficios">Beneficios (uno por línea)</Label>
                <Textarea
                  id="beneficios"
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  name="estado"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando planes...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planes.map((plan) => (
            <Card key={plan._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.nombre}</CardTitle>
                  <Badge variant={plan.estado === "activo" ? "default" : "outline"}>
                    {plan.estado === "activo" ? "activo" : "inactivo"}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{formatCOP(plan.precio)}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.duracion === 30 ? "Mensual" : plan.duracion === 365 ? "Anual" : `${plan.duracion} días`}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="mb-4 text-sm text-muted-foreground">{plan.descripcion}</p>
                <div>
                  <h4 className="font-medium mb-2">Beneficios:</h4>
                  <ul className="space-y-1">
                    {plan.beneficios.map((beneficio, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => prepareEditForm(plan)}>
                  <Edit className="h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive"
                  onClick={() => {
                    setCurrentPlan(plan)
                    setOpenDeleteDialog(true)
                  }}
                >
                  <Trash className="h-4 w-4" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de edición */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Plan de Membresía</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input id="edit-nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-precio">Precio (COP)</Label>
              <Input
                id="edit-precio"
                name="precio"
                type="number"
                step="1000"
                value={formData.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-duracion">Duración (días)</Label>
              <Input
                id="edit-duracion"
                name="duracion"
                type="number"
                value={formData.duracion}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-beneficios">Beneficios (uno por línea)</Label>
              <Textarea
                id="edit-beneficios"
                name="beneficios"
                value={formData.beneficios}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <select
                id="edit-estado"
                name="estado"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit">Actualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Estás seguro de que deseas eliminar el plan "{currentPlan?.nombre}"?</p>
            <p className="text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
