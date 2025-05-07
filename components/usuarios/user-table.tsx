"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Avatar } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { formatDate } from "../../lib/utils"
import { formatCOP } from "../../lib/currency"
import { Eye, Edit, Trash, Loader2, MessageSquare } from "lucide-react"
import { toast } from "../../components/ui/use-toast"

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
    porcentajeDiasTranscurridos: number
    diasRestantes: number
  }
}

interface UserTableProps {
  loadingUsers: boolean
  usuariosFiltrados: UsuarioConPago[]
  openViewDialog: (user: UsuarioConPago) => void
  openEditDialog: (user: UsuarioConPago) => void
  handleDeleteUser: (userId: string) => Promise<void>
}

export function UserTable({
  loadingUsers,
  usuariosFiltrados,
  openViewDialog,
  openEditDialog,
  handleDeleteUser,
}: UserTableProps) {
  const sendWhatsAppNotification = async (userId: string) => {
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al enviar notificación")
      }

      toast({
        title: "Notificación enviada",
        description: "Se ha enviado un mensaje de WhatsApp al usuario",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar notificación",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Listado de Miembros</h2>

      {loadingUsers ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!usuariosFiltrados || usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((user) => {
                  // Verificar si el usuario está cerca de completar su plan (≥90% de días transcurridos)
                  const casiCompleto =
                    user.estado === "activo" &&
                    (user.infoPago?.porcentajeDiasTranscurridos || 0) >= 90 &&
                    (user.infoPago?.porcentajeDiasTranscurridos || 0) < 100

                  return (
                    <TableRow key={user._id} className={casiCompleto ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <div
                              className={`${casiCompleto ? "bg-red-500" : "bg-primary"} text-primary-foreground h-full w-full flex items-center justify-center font-semibold`}
                            >
                              {user.nombre.charAt(0)}
                            </div>
                          </Avatar>
                          <div>
                            <div className={`font-medium ${casiCompleto ? "text-red-600 dark:text-red-400" : ""}`}>
                              {user.nombre}
                              {casiCompleto && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  {user.infoPago?.diasRestantes} días restantes
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.cedula}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.plan ? user.plan.nombre : "Sin plan"}</TableCell>
                      <TableCell>
                        {user.plan ? (
                          <div className="w-40">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Pagado: {formatCOP(user.montoPagado || 0)}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Total: {formatCOP(user.plan.precio)}</span>
                              <span>{user.infoPago?.porcentajePago || 0}%</span>
                            </div>
                            <Progress value={user.infoPago?.porcentajePago || 0} className="h-2" />
                            {(user.infoPago?.saldoPendiente || 0) > 0 && (
                              <div className="text-xs text-amber-500 mt-1">
                                Pendiente: {formatCOP(user.infoPago?.saldoPendiente || 0)}
                              </div>
                            )}
                            {casiCompleto && (
                              <div className="text-xs text-red-500 mt-1 font-medium">
                                Plan al {user.infoPago?.porcentajeDiasTranscurridos}% de completarse
                              </div>
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{user.fechaInicio ? formatDate(user.fechaInicio) : "-"}</TableCell>
                      <TableCell>{user.fechaFin ? formatDate(user.fechaFin) : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.estado === "activo" ? "default" : "destructive"}>
                          {user.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.telefono}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openViewDialog(user)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                          {user.telefono && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={() => sendWhatsAppNotification(user._id)}
                              title="Enviar notificación WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Enviar WhatsApp</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
