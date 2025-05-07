"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Plus, Edit, Trash, Eye, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "../../components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"

// Interfaces
interface Ejercicio {
  nombre: string
  series: number
  repeticiones: number
  descanso: number
}

interface Rutina {
  _id: string
  nombre: string
  descripcion: string
  ejercicios: Ejercicio[]
  estado: "activo" | "inactivo"
  createdAt?: string
  updatedAt?: string
}

export default function RutinasPage() {
  // Estados
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para modales
  const [modalCrear, setModalCrear] = useState(false)
  const [modalVer, setModalVer] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // Estado para la rutina seleccionada
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<Rutina | null>(null)

  // Estado para nueva rutina
  const [nuevaRutina, setNuevaRutina] = useState<Omit<Rutina, "_id">>({
    nombre: "",
    descripcion: "",
    ejercicios: [],
    estado: "activo",
  })

  // Estado para nuevo ejercicio
  const [nuevoEjercicio, setNuevoEjercicio] = useState<Ejercicio>({
    nombre: "",
    series: 3,
    repeticiones: 10,
    descanso: 60,
  })

  // Cargar rutinas al iniciar
  useEffect(() => {
    cargarRutinas()
  }, [])

  // Función para cargar rutinas desde la API
  const cargarRutinas = async () => {
    setCargando(true)
    try {
      const respuesta = await fetch("/api/rutinas")
      if (!respuesta.ok) {
        throw new Error("Error al cargar las rutinas")
      }
      const datos = await respuesta.json()
      setRutinas(datos.rutinas)
    } catch (err) {
      setError("Error al cargar las rutinas")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  // Función para crear una nueva rutina
  const crearRutina = async () => {
    try {
      if (nuevaRutina.ejercicios.length === 0) {
        toast({
          title: "Error",
          description: "Debes agregar al menos un ejercicio a la rutina",
          variant: "destructive",
        })
        return
      }

      const respuesta = await fetch("/api/rutinas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaRutina),
      })

      if (!respuesta.ok) {
        throw new Error("Error al crear la rutina")
      }

      await cargarRutinas()
      setModalCrear(false)
      resetearFormulario()

      toast({
        title: "Éxito",
        description: "Rutina creada correctamente",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive",
      })
    }
  }

  // Función para actualizar una rutina
  const actualizarRutina = async () => {
    if (!rutinaSeleccionada) return

    try {
      const respuesta = await fetch(`/api/rutinas/${rutinaSeleccionada._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rutinaSeleccionada),
      })

      if (!respuesta.ok) {
        throw new Error("Error al actualizar la rutina")
      }

      await cargarRutinas()
      setModalEditar(false)

      toast({
        title: "Éxito",
        description: "Rutina actualizada correctamente",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo actualizar la rutina",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar una rutina
  const eliminarRutina = async () => {
    if (!rutinaSeleccionada) return

    try {
      const respuesta = await fetch(`/api/rutinas/${rutinaSeleccionada._id}`, {
        method: "DELETE",
      })

      if (!respuesta.ok) {
        throw new Error("Error al eliminar la rutina")
      }

      await cargarRutinas()
      setModalEliminar(false)

      toast({
        title: "Éxito",
        description: "Rutina eliminada correctamente",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina",
        variant: "destructive",
      })
    }
  }

  // Función para agregar un ejercicio a la nueva rutina
  const agregarEjercicio = () => {
    if (!nuevoEjercicio.nombre) {
      toast({
        title: "Error",
        description: "El nombre del ejercicio es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (modalEditar && rutinaSeleccionada) {
      setRutinaSeleccionada({
        ...rutinaSeleccionada,
        ejercicios: [...rutinaSeleccionada.ejercicios, { ...nuevoEjercicio }],
      })
    } else {
      setNuevaRutina({
        ...nuevaRutina,
        ejercicios: [...nuevaRutina.ejercicios, { ...nuevoEjercicio }],
      })
    }

    // Resetear el formulario de ejercicio
    setNuevoEjercicio({
      nombre: "",
      series: 3,
      repeticiones: 10,
      descanso: 60,
    })
  }

  // Función para eliminar un ejercicio
  const eliminarEjercicio = (index: number) => {
    if (modalEditar && rutinaSeleccionada) {
      const ejerciciosActualizados = [...rutinaSeleccionada.ejercicios]
      ejerciciosActualizados.splice(index, 1)
      setRutinaSeleccionada({
        ...rutinaSeleccionada,
        ejercicios: ejerciciosActualizados,
      })
    } else {
      const ejerciciosActualizados = [...nuevaRutina.ejercicios]
      ejerciciosActualizados.splice(index, 1)
      setNuevaRutina({
        ...nuevaRutina,
        ejercicios: ejerciciosActualizados,
      })
    }
  }

  // Función para resetear el formulario
  const resetearFormulario = () => {
    setNuevaRutina({
      nombre: "",
      descripcion: "",
      ejercicios: [],
      estado: "activo",
    })
    setNuevoEjercicio({
      nombre: "",
      series: 3,
      repeticiones: 10,
      descanso: 60,
    })
  }

  // Función para abrir el modal de ver rutina
  const abrirModalVer = (rutina: Rutina) => {
    setRutinaSeleccionada(rutina)
    setModalVer(true)
  }

  // Función para abrir el modal de editar rutina
  const abrirModalEditar = (rutina: Rutina) => {
    setRutinaSeleccionada({ ...rutina })
    setModalEditar(true)
  }

  // Función para abrir el modal de eliminar rutina
  const abrirModalEliminar = (rutina: Rutina) => {
    setRutinaSeleccionada(rutina)
    setModalEliminar(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rutinas de Ejercicio</h1>
          <p className="text-muted-foreground">Crea y gestiona rutinas de entrenamiento para los miembros</p>
        </div>
        <Button className="gap-2" onClick={() => setModalCrear(true)}>
          <Plus className="h-4 w-4" /> Crear Nueva Rutina
        </Button>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando rutinas...</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive text-center">{error}</div>
      ) : rutinas.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No hay rutinas disponibles. Crea una nueva rutina para comenzar.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {rutinas.map((rutina) => (
            <Card key={rutina._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{rutina.nombre}</CardTitle>
                  <Badge variant={rutina.estado === "activo" ? "default" : "outline"}>
                    {rutina.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rutina.descripcion}</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ejercicio</TableHead>
                      <TableHead className="text-center">Series</TableHead>
                      <TableHead className="text-center">Repeticiones</TableHead>
                      <TableHead className="text-center">Descanso (seg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rutina.ejercicios.map((ejercicio, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                        <TableCell className="text-center">{ejercicio.series}</TableCell>
                        <TableCell className="text-center">{ejercicio.repeticiones}</TableCell>
                        <TableCell className="text-center">{ejercicio.descanso}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => abrirModalVer(rutina)}>
                  <Eye className="h-4 w-4" /> Ver
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => abrirModalEditar(rutina)}>
                  <Edit className="h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive"
                  onClick={() => abrirModalEliminar(rutina)}
                >
                  <Trash className="h-4 w-4" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear nueva rutina */}
      <Dialog open={modalCrear} onOpenChange={setModalCrear}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Rutina</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre de la Rutina</Label>
                <Input
                  id="nombre"
                  value={nuevaRutina.nombre}
                  onChange={(e) => setNuevaRutina({ ...nuevaRutina, nombre: e.target.value })}
                  placeholder="Ej: Rutina Full Body"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={nuevaRutina.descripcion}
                  onChange={(e) => setNuevaRutina({ ...nuevaRutina, descripcion: e.target.value })}
                  placeholder="Describe brevemente esta rutina"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={nuevaRutina.estado}
                  onValueChange={(valor) => setNuevaRutina({ ...nuevaRutina, estado: valor as "activo" | "inactivo" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Ejercicios</h3>

              {nuevaRutina.ejercicios.length > 0 ? (
                <div className="mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ejercicio</TableHead>
                        <TableHead className="text-center">Series</TableHead>
                        <TableHead className="text-center">Repeticiones</TableHead>
                        <TableHead className="text-center">Descanso (seg)</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nuevaRutina.ejercicios.map((ejercicio, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                          <TableCell className="text-center">{ejercicio.series}</TableCell>
                          <TableCell className="text-center">{ejercicio.repeticiones}</TableCell>
                          <TableCell className="text-center">{ejercicio.descanso}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarEjercicio(index)}
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">No hay ejercicios agregados. Agrega al menos un ejercicio.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <div className="grid gap-2">
                  <Label htmlFor="ejercicio-nombre">Nombre del Ejercicio</Label>
                  <Input
                    id="ejercicio-nombre"
                    value={nuevoEjercicio.nombre}
                    onChange={(e) => setNuevoEjercicio({ ...nuevoEjercicio, nombre: e.target.value })}
                    placeholder="Ej: Sentadillas"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ejercicio-series">Series</Label>
                  <Input
                    id="ejercicio-series"
                    type="number"
                    value={nuevoEjercicio.series}
                    onChange={(e) =>
                      setNuevoEjercicio({ ...nuevoEjercicio, series: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ejercicio-repeticiones">Repeticiones</Label>
                  <Input
                    id="ejercicio-repeticiones"
                    type="number"
                    value={nuevoEjercicio.repeticiones}
                    onChange={(e) =>
                      setNuevoEjercicio({ ...nuevoEjercicio, repeticiones: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ejercicio-descanso">Descanso (segundos)</Label>
                  <Input
                    id="ejercicio-descanso"
                    type="number"
                    value={nuevoEjercicio.descanso}
                    onChange={(e) =>
                      setNuevoEjercicio({ ...nuevoEjercicio, descanso: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="button" onClick={agregarEjercicio}>
                    Agregar Ejercicio
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalCrear(false)
                resetearFormulario()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={crearRutina}>Guardar Rutina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles de rutina */}
      <Dialog open={modalVer} onOpenChange={setModalVer}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de Rutina</DialogTitle>
          </DialogHeader>
          {rutinaSeleccionada && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{rutinaSeleccionada.nombre}</h2>
                <Badge variant={rutinaSeleccionada.estado === "activo" ? "default" : "outline"}>
                  {rutinaSeleccionada.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{rutinaSeleccionada.descripcion}</p>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Ejercicios</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ejercicio</TableHead>
                      <TableHead className="text-center">Series</TableHead>
                      <TableHead className="text-center">Repeticiones</TableHead>
                      <TableHead className="text-center">Descanso (seg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rutinaSeleccionada.ejercicios.map((ejercicio, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                        <TableCell className="text-center">{ejercicio.series}</TableCell>
                        <TableCell className="text-center">{ejercicio.repeticiones}</TableCell>
                        <TableCell className="text-center">{ejercicio.descanso}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setModalVer(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar rutina */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rutina</DialogTitle>
          </DialogHeader>
          {rutinaSeleccionada && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nombre">Nombre de la Rutina</Label>
                  <Input
                    id="edit-nombre"
                    value={rutinaSeleccionada.nombre}
                    onChange={(e) => setRutinaSeleccionada({ ...rutinaSeleccionada, nombre: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-descripcion">Descripción</Label>
                  <Textarea
                    id="edit-descripcion"
                    value={rutinaSeleccionada.descripcion}
                    onChange={(e) => setRutinaSeleccionada({ ...rutinaSeleccionada, descripcion: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-estado">Estado</Label>
                  <Select
                    value={rutinaSeleccionada.estado}
                    onValueChange={(valor) =>
                      setRutinaSeleccionada({ ...rutinaSeleccionada, estado: valor as "activo" | "inactivo" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Ejercicios</h3>

                {rutinaSeleccionada.ejercicios.length > 0 ? (
                  <div className="mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ejercicio</TableHead>
                          <TableHead className="text-center">Series</TableHead>
                          <TableHead className="text-center">Repeticiones</TableHead>
                          <TableHead className="text-center">Descanso (seg)</TableHead>
                          <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rutinaSeleccionada.ejercicios.map((ejercicio, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                            <TableCell className="text-center">{ejercicio.series}</TableCell>
                            <TableCell className="text-center">{ejercicio.repeticiones}</TableCell>
                            <TableCell className="text-center">{ejercicio.descanso}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarEjercicio(index)}
                                className="text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4">
                    No hay ejercicios agregados. Agrega al menos un ejercicio.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-ejercicio-nombre">Nombre del Ejercicio</Label>
                    <Input
                      id="edit-ejercicio-nombre"
                      value={nuevoEjercicio.nombre}
                      onChange={(e) => setNuevoEjercicio({ ...nuevoEjercicio, nombre: e.target.value })}
                      placeholder="Ej: Sentadillas"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-ejercicio-series">Series</Label>
                    <Input
                      id="edit-ejercicio-series"
                      type="number"
                      value={nuevoEjercicio.series}
                      onChange={(e) =>
                        setNuevoEjercicio({ ...nuevoEjercicio, series: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-ejercicio-repeticiones">Repeticiones</Label>
                    <Input
                      id="edit-ejercicio-repeticiones"
                      type="number"
                      value={nuevoEjercicio.repeticiones}
                      onChange={(e) =>
                        setNuevoEjercicio({ ...nuevoEjercicio, repeticiones: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-ejercicio-descanso">Descanso (segundos)</Label>
                    <Input
                      id="edit-ejercicio-descanso"
                      type="number"
                      value={nuevoEjercicio.descanso}
                      onChange={(e) =>
                        setNuevoEjercicio({ ...nuevoEjercicio, descanso: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="button" onClick={agregarEjercicio}>
                      Agregar Ejercicio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>
              Cancelar
            </Button>
            <Button onClick={actualizarRutina}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la rutina
              {rutinaSeleccionada && <strong> "{rutinaSeleccionada.nombre}"</strong>} y todos sus ejercicios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={eliminarRutina}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
