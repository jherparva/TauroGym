"use client"

import type React from "react"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { Loader2, Trash2, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Task {
  id: string
  nombre: string
  tipo: string
  frecuencia: string
  dia?: string
  hora: string
  activa: boolean
  ultimaEjecucion: string
  proximaEjecucion: string
}

export function TaskSchedulingModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Estado para tareas programadas
  const [tasks, setTasks] = useState<Task[]>([])

  // Estado para nueva tarea
  const [newTask, setNewTask] = useState({
    nombre: "",
    tipo: "",
    frecuencia: "diaria",
    dia: "",
    hora: "00:00",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTask = async () => {
    if (!newTask.nombre || !newTask.tipo || !newTask.frecuencia || !newTask.hora) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (newTask.frecuencia === "semanal" && !newTask.dia) {
      toast({
        title: "Error",
        description: "Seleccione un día de la semana para la tarea semanal",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) {
        throw new Error("Error al crear tarea")
      }

      const data = await response.json()

      // Actualizar la lista de tareas
      setTasks((prev) => [...prev, data.task])

      // Limpiar el formulario
      setNewTask({
        nombre: "",
        tipo: "",
        frecuencia: "diaria",
        dia: "",
        hora: "00:00",
      })

      toast({
        title: "Tarea programada",
        description: "La tarea ha sido programada correctamente",
      })
    } catch (error) {
      console.error("Error al crear tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo programar la tarea",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTask = async (taskId: string, currentState: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activa: !currentState }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar tarea")
      }

      // Actualizar el estado de la tarea
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            return { ...task, activa: !currentState }
          }
          return task
        }),
      )

      toast({
        title: "Tarea actualizada",
        description: `La tarea ha sido ${!currentState ? "activada" : "desactivada"} correctamente`,
      })
    } catch (error) {
      console.error("Error al actualizar tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Está seguro de eliminar esta tarea?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar tarea")
      }

      // Actualizar la lista de tareas
      setTasks((prev) => prev.filter((task) => task.id !== taskId))

      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const response = await fetch("/api/tasks")
      if (!response.ok) throw new Error("Error al cargar tareas")

      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas programadas",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  // Cargar datos al abrir el modal
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      loadData()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "No ejecutada"
    const date = new Date(dateString)
    return date.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Configurar Tareas
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Programación de Tareas</DialogTitle>
          <DialogDescription>
            Configure tareas automáticas como notificaciones, respaldos y mantenimiento del sistema.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Cargando datos...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Nueva tarea programada</CardTitle>
                <CardDescription>Configure una nueva tarea automática</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la tarea</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={newTask.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Respaldo diario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de tarea</Label>
                    <Select value={newTask.tipo} onValueChange={handleSelectChange("tipo")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backup">Respaldo</SelectItem>
                        <SelectItem value="notificacion">Notificación</SelectItem>
                        <SelectItem value="reporte">Reporte</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frecuencia">Frecuencia</Label>
                    <Select value={newTask.frecuencia} onValueChange={handleSelectChange("frecuencia")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diaria">Diaria</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newTask.frecuencia === "semanal" && (
                    <div className="space-y-2">
                      <Label htmlFor="dia">Día de la semana</Label>
                      <Select value={newTask.dia} onValueChange={handleSelectChange("dia")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lunes">Lunes</SelectItem>
                          <SelectItem value="martes">Martes</SelectItem>
                          <SelectItem value="miercoles">Miércoles</SelectItem>
                          <SelectItem value="jueves">Jueves</SelectItem>
                          <SelectItem value="viernes">Viernes</SelectItem>
                          <SelectItem value="sabado">Sábado</SelectItem>
                          <SelectItem value="domingo">Domingo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora de ejecución</Label>
                    <Input id="hora" name="hora" type="time" value={newTask.hora} onChange={handleInputChange} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddTask} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Programar tarea
                </Button>
              </CardFooter>
            </Card>

            <div className="rounded-md border">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Tareas programadas</h3>
                {tasks.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No hay tareas programadas</p>
                ) : (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            Nombre
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Tipo
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Frecuencia
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Próxima ejecución
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Estado
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                            <td className="px-4 py-3">{task.nombre}</td>
                            <td className="px-4 py-3">
                              {task.tipo === "backup" && "Respaldo"}
                              {task.tipo === "notificacion" && "Notificación"}
                              {task.tipo === "reporte" && "Reporte"}
                              {task.tipo === "mantenimiento" && "Mantenimiento"}
                            </td>
                            <td className="px-4 py-3">
                              {task.frecuencia === "diaria" && `Diaria a las ${task.hora}`}
                              {task.frecuencia === "semanal" && `${task.dia} a las ${task.hora}`}
                              {task.frecuencia === "mensual" && `Mensual a las ${task.hora}`}
                            </td>
                            <td className="px-4 py-3">{formatDate(task.proximaEjecucion)}</td>
                            <td className="px-4 py-3">
                              <Switch
                                checked={task.activa}
                                onCheckedChange={() => handleToggleTask(task.id, task.activa)}
                                disabled={isLoading}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="h-8 w-8 p-0 text-red-500"
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
