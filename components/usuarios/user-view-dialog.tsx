"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import { formatCOP } from "@/lib/currency"
import { toast } from "@/components/ui/use-toast"

// Actualizar la interfaz UsuarioConPago para incluir los nuevos campos
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

interface UserViewDialogProps {
  viewUser: UsuarioConPago | null
  setViewUser: (user: UsuarioConPago | null) => void
  openEditDialog: (user: UsuarioConPago) => void
  handleAbonoUser: (userId: string, montoAbono: number) => Promise<void>
}

// Modificar la función UserViewDialog para mostrar información sobre días transcurridos
export function UserViewDialog({ viewUser, setViewUser, openEditDialog, handleAbonoUser }: UserViewDialogProps) {
  // Verificar si el usuario está cerca de completar su plan (≥90% de días transcurridos)
  const casiCompleto =
    viewUser &&
    viewUser.estado === "activo" &&
    viewUser.infoPago &&
    viewUser.infoPago.porcentajeDiasTranscurridos >= 90 &&
    viewUser.infoPago.porcentajeDiasTranscurridos < 100

  return (
    <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Miembro</DialogTitle>
          <DialogDescription>Información completa del miembro del gimnasio.</DialogDescription>
        </DialogHeader>
        {viewUser && (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <div
                  className={`${casiCompleto ? "bg-red-500" : "bg-primary"} text-primary-foreground h-full w-full flex items-center justify-center text-xl font-semibold`}
                >
                  {viewUser.nombre.charAt(0)}
                </div>
              </Avatar>
              <div>
                <h3 className={`text-lg font-semibold ${casiCompleto ? "text-red-600 dark:text-red-400" : ""}`}>
                  {viewUser.nombre}
                  {casiCompleto && (
                    <Badge variant="destructive" className="ml-2">
                      {viewUser.infoPago?.diasRestantes} días restantes
                    </Badge>
                  )}
                </h3>
                <p className="text-muted-foreground">{viewUser.cedula}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado:</p>
                  <Badge variant={viewUser.estado === "activo" ? "default" : "destructive"}>
                    {viewUser.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono:</p>
                  <p>{viewUser.telefono || "No disponible"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Correo electrónico:</p>
                <p>{viewUser.email || "No disponible"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Dirección:</p>
                <p>{viewUser.direccion || "No disponible"}</p>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Plan de membresía:</p>
                <p className="font-medium">{viewUser.plan ? viewUser.plan.nombre : "Sin plan"}</p>

                {viewUser.plan && (
                  <>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          Pagado: {formatCOP(viewUser.montoPagado || 0)} de {formatCOP(viewUser.plan.precio)}
                        </span>
                        <span>{viewUser.infoPago?.porcentajePago || 0}%</span>
                      </div>
                      <Progress value={viewUser.infoPago?.porcentajePago || 0} className="h-2" />
                      {(viewUser.infoPago?.saldoPendiente || 0) > 0 && (
                        <div className="text-xs text-amber-500 mt-1">
                          Pendiente: {formatCOP(viewUser.infoPago?.saldoPendiente || 0)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha inicio:</p>
                        <p>{viewUser.fechaInicio ? formatDate(viewUser.fechaInicio) : "No disponible"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha fin:</p>
                        <p>{viewUser.fechaFin ? formatDate(viewUser.fechaFin) : "No disponible"}</p>
                      </div>
                    </div>

                    {/* Mostrar progreso del plan en días */}
                    {viewUser.estado === "activo" && viewUser.fechaInicio && viewUser.fechaFin && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso del plan:</span>
                          <span>{viewUser.infoPago?.porcentajeDiasTranscurridos || 0}%</span>
                        </div>
                        <Progress
                          value={viewUser.infoPago?.porcentajeDiasTranscurridos || 0}
                          className={`h-2 ${casiCompleto ? "bg-red-200 dark:bg-red-950" : ""}`}
                          indicatorClassName={casiCompleto ? "bg-red-500" : ""}
                        />
                        {casiCompleto && (
                          <div className="text-xs text-red-500 font-medium mt-1">
                            ¡Alerta! Quedan {viewUser.infoPago?.diasRestantes} días para que finalice el plan
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sección para registrar abono si el plan no está completamente pagado */}
                    {viewUser.plan && (viewUser.infoPago?.saldoPendiente || 0) > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-medium mb-2">Registrar abono:</p>
                        <div className="flex gap-2">
                          <Input
                            id="abono-amount"
                            type="number"
                            placeholder="Monto del abono"
                            className="flex-1"
                            defaultValue={(viewUser.infoPago?.saldoPendiente || 0).toString()}
                          />
                          <Button
                            onClick={() => {
                              const abonoInput = document.getElementById("abono-amount") as HTMLInputElement
                              const montoAbono = Number.parseFloat(abonoInput.value)
                              if (isNaN(montoAbono) || montoAbono <= 0) {
                                toast({
                                  title: "Error",
                                  description: "Ingrese un monto válido para el abono",
                                  variant: "destructive",
                                })
                                return
                              }
                              handleAbonoUser(viewUser._id, montoAbono)
                              setViewUser(null)
                            }}
                          >
                            Registrar Abono
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewUser(null)}>
            Cerrar
          </Button>
          <Button
            onClick={() => {
              if (viewUser) {
                openEditDialog(viewUser)
                setViewUser(null)
              }
            }}
          >
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
