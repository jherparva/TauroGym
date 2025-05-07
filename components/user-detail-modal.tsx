"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCOP } from "@/lib/currency"
import { Loader2 } from "lucide-react"

interface Plan {
  _id: string
  nombre: string
  descripcion: string
  precio: number
  duracion: number
  beneficios: string[]
  estado: "activo" | "inactivo"
}

interface User {
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
    descripcion: string
    precio: number
    duracion: number
    beneficios: string[]
    estado: "activo" | "inactivo"
  }
  fechaInicio?: string
  fechaFin?: string
  montoPagado: number
  createdAt?: string
  updatedAt?: string
}

interface Attendance {
  _id: string
  usuario: string
  fecha: string
  horaEntrada: string
  horaSalida?: string
  observaciones?: string
}

interface UserDetailModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")

  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Función para formatear horas
  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return format(date, "HH:mm", { locale: es })
  }

  useEffect(() => {
    if (isOpen && user) {
      const fetchUserData = async () => {
        setLoading(true)
        try {
          // Obtener asistencias del usuario
          const attendanceResponse = await fetch(`/api/asistencia?usuario=${user._id}`)
          const attendanceData = await attendanceResponse.json()
          setAttendance(attendanceData.asistencias || [])
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    }
  }, [isOpen, user])

  if (!user) return null

  // Calcular saldo pendiente
  const saldoPendiente = user.plan ? Math.max(0, user.plan.precio - user.montoPagado) : 0
  const porcentajePago = user.plan ? Math.min(100, Math.round((user.montoPagado / user.plan.precio) * 100)) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles del Miembro</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xl font-semibold">
                  {user.nombre ? user.nombre.charAt(0) : "U"}
                </div>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{user.nombre}</h3>
                <p className="text-muted-foreground">Cédula: {user.cedula}</p>
                <Badge variant={user.estado === "activo" ? "default" : "destructive"} className="mt-1">
                  {user.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Email:</span>
                    <span className="col-span-2">{user.email || "No disponible"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Teléfono:</span>
                    <span className="col-span-2">{user.telefono || "No disponible"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Dirección:</span>
                    <span className="col-span-2">{user.direccion || "No disponible"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Fecha de Nacimiento:</span>
                    <span className="col-span-2">
                      {user.fechaNacimiento ? formatDate(user.fechaNacimiento.toString()) : "No disponible"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Membresía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Plan:</span>
                    <span className="col-span-2">{user.plan ? user.plan.nombre : "Sin plan"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Fecha Inicio:</span>
                    <span className="col-span-2">{formatDate(user.fechaInicio)}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Fecha Fin:</span>
                    <span className="col-span-2">{formatDate(user.fechaFin)}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Monto Pagado:</span>
                    <span className="col-span-2">{formatCOP(user.montoPagado)}</span>
                  </div>
                  {user.plan && (
                    <>
                      <div className="grid grid-cols-3">
                        <span className="font-medium">Precio del Plan:</span>
                        <span className="col-span-2">{formatCOP(user.plan.precio)}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-medium">Saldo Pendiente:</span>
                        <span className="col-span-2">{formatCOP(saldoPendiente)}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-medium">Porcentaje Pagado:</span>
                        <span className="col-span-2">{porcentajePago}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${porcentajePago}%` }}></div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : attendance.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Historial de Asistencia</h3>
                <div className="border rounded-md">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Hora Entrada
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Hora Salida
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Observaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {attendance.map((record) => (
                        <tr key={record._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(record.fecha)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{formatTime(record.horaEntrada)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {record.horaSalida ? formatTime(record.horaSalida) : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{record.observaciones || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay registros de asistencia para este miembro.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
