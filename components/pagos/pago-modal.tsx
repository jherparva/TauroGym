//C:\Users\jhon\Music\TauroGym\components\pagos\pago-modal.tsx

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "../ui/use-toast"
import { Loader2 } from "lucide-react"
import { formatCOP } from "../../lib/currency"
import { addDays, addWeeks, addMonths } from "date-fns"

interface PagoModalProps {
  onPagoCreado: () => void
  tipo: "nuevoPago" | "abono" | "editar" | "diaUnico"
  buttonText: string
  buttonIcon: React.ReactNode | null
  pagoExistente?: any
}

export function PagoModal({ onPagoCreado, tipo, buttonText, buttonIcon, pagoExistente }: PagoModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [planes, setPlanes] = useState<any[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null)
  const [formData, setFormData] = useState({
    usuario: "",
    plan: "",
    monto: 0,
    montoTotal: 0,
    montoPagado: 0,
    saldoPendiente: 0,
    fecha: new Date().toISOString().split("T")[0],
    fechaFin: "",
    metodo: "efectivo",
    estado: "pendiente",
  })

  useEffect(() => {
    // Cargar usuarios y planes al abrir el modal
    if (open) {
      fetchUsuarios()
      fetchPlanes()

      // Si es un pago existente, cargar sus datos
      if (pagoExistente && (tipo === "editar" || tipo === "abono")) {
        if (tipo === "abono") {
          // Para abono, solo necesitamos el usuario y el monto pendiente
          setFormData({
            ...formData,
            usuario: pagoExistente.usuario?._id || "",
            plan: pagoExistente.plan?._id || "",
            montoTotal: pagoExistente.plan?.precio || 0,
            montoPagado: pagoExistente.montoPagado || 0,
            saldoPendiente: pagoExistente.plan?.precio - (pagoExistente.montoPagado || 0) || 0,
            monto: pagoExistente.plan?.precio - (pagoExistente.montoPagado || 0) || 0, // Por defecto, el monto del abono es el saldo pendiente
            metodo: "efectivo",
          })
        } else {
          // Para editar, cargamos todos los datos del usuario
          setFormData({
            usuario: pagoExistente._id || "",
            plan: pagoExistente.plan?._id || "",
            monto: pagoExistente.montoPagado || 0,
            montoTotal: pagoExistente.plan?.precio || 0,
            montoPagado: pagoExistente.montoPagado || 0,
            saldoPendiente: pagoExistente.plan?.precio - (pagoExistente.montoPagado || 0) || 0,
            fecha: pagoExistente.fechaInicio
              ? new Date(pagoExistente.fechaInicio).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            fechaFin: pagoExistente.fechaFin ? new Date(pagoExistente.fechaFin).toISOString().split("T")[0] : "",
            metodo: "efectivo",
            estado: pagoExistente.estado || "pendiente",
          })
        }
      }
    }
  }, [open, pagoExistente, tipo])

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios?estado=activo")
      if (!response.ok) throw new Error("Error al cargar usuarios")
      const data = await response.json()
      setUsuarios(data.users || [])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    }
  }

  const fetchPlanes = async () => {
    try {
      const response = await fetch("/api/planes?estado=activo")
      if (!response.ok) throw new Error("Error al cargar planes")
      const data = await response.json()
      setPlanes(data.planes || [])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      })
    }
  }

  // Cargar detalles del usuario seleccionado
  const fetchUsuarioDetalles = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/usuarios/${usuarioId}`)
      if (!response.ok) throw new Error("Error al cargar detalles del usuario")
      const data = await response.json()
      setUsuarioSeleccionado(data.user)

      // Verificar si el usuario ya tiene un plan completamente pagado
      if (data.user.plan && data.user.montoPagado >= data.user.plan.precio) {
        toast({
          title: "Información",
          description: "Este usuario ya tiene un plan completamente pagado",
        })
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "monto" || name === "montoTotal" || name === "montoPagado") {
      const numValue = Number(value)
      setFormData((prev) => {
        const newData = { ...prev, [name]: numValue }

        // Si estamos cambiando el monto pagado, actualizar el saldo pendiente
        if (name === "montoPagado" || name === "monto") {
          const montoActualizado = name === "monto" ? numValue : newData.monto
          const montoPagadoActualizado = name === "montoPagado" ? numValue : newData.montoPagado

          // Si es un abono, el monto pagado es el existente más el nuevo monto
          if (tipo === "abono") {
            newData.montoPagado = montoPagadoActualizado + montoActualizado
          } else if (tipo === "nuevoPago") {
            newData.montoPagado = montoActualizado
          }

          newData.saldoPendiente = Math.max(0, newData.montoTotal - newData.montoPagado)

          // Actualizar el estado basado en el saldo pendiente
          if (newData.saldoPendiente <= 0) {
            newData.estado = "completado"
          } else if (newData.montoPagado > 0) {
            newData.estado = "abono"
          } else {
            newData.estado = "pendiente"
          }
        }

        return newData
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      // Si estamos seleccionando un usuario, cargar sus detalles
      if (name === "usuario" && value) {
        fetchUsuarioDetalles(value)
      }

      // Si estamos seleccionando un plan, actualizar el monto total y calcular fecha fin
      if (name === "plan" && value !== "diaUnico") {
        const planSeleccionado = planes.find((plan) => plan._id === value)
        if (planSeleccionado) {
          const montoTotal = planSeleccionado.precio
          const montoPagado = prev.monto || 0
          const saldoPendiente = Math.max(0, montoTotal - montoPagado)

          // Calcular fecha fin basada en el tipo de duración del plan
          const fechaInicio = new Date(prev.fecha)
          let fechaFin = new Date(fechaInicio)

          if (planSeleccionado.tipoDuracion === "dia") {
            fechaFin = addDays(fechaInicio, planSeleccionado.duracion)
          } else if (planSeleccionado.tipoDuracion === "semana") {
            fechaFin = addWeeks(fechaInicio, planSeleccionado.duracion)
          } else if (planSeleccionado.tipoDuracion === "quincena") {
            fechaFin = addDays(fechaInicio, planSeleccionado.duracion * 15)
          } else if (planSeleccionado.tipoDuracion === "mes") {
            fechaFin = addMonths(fechaInicio, planSeleccionado.duracion)
          }

          return {
            ...prev,
            [name]: value,
            montoTotal,
            saldoPendiente,
            fechaFin: fechaFin.toISOString().split("T")[0],
            estado: saldoPendiente <= 0 ? "completado" : montoPagado > 0 ? "abono" : "pendiente",
          }
        }
      }

      // Si es día único, establecer valores predeterminados
      if (name === "plan" && value === "diaUnico") {
        return {
          ...prev,
          [name]: value,
          montoTotal: prev.monto,
          montoPagado: prev.monto,
          saldoPendiente: 0,
          estado: "completado",
          fechaFin: prev.fecha, // La fecha fin es la misma que la fecha inicio para día único
        }
      }

      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validar datos
      if (tipo !== "diaUnico" && !formData.plan) {
        toast({
          title: "Error",
          description: "Debe seleccionar un plan",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.usuario) {
        toast({
          title: "Error",
          description: "Debe seleccionar un usuario",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (formData.monto <= 0) {
        toast({
          title: "Error",
          description: "El monto debe ser mayor a cero",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Verificar si el usuario ya tiene un plan completamente pagado
      if (
        usuarioSeleccionado &&
        usuarioSeleccionado.plan &&
        usuarioSeleccionado.montoPagado >= usuarioSeleccionado.plan.precio &&
        tipo !== "editar" &&
        tipo !== "diaUnico"
      ) {
        toast({
          title: "Error",
          description: "Este usuario ya tiene un plan completamente pagado",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Preparar datos para enviar
      const dataToSend: any = {
        plan: formData.plan,
        montoPagado: formData.montoPagado,
        fechaInicio: formData.fecha,
        fechaFin: formData.fechaFin,
        estado: formData.estado,
      }

      // Si es un abono, asegurarse de que el monto no exceda el saldo pendiente
      if (tipo === "abono" && pagoExistente) {
        const saldoPendiente = pagoExistente.plan?.precio - (pagoExistente.montoPagado || 0) || 0
        if (formData.monto > saldoPendiente) {
          toast({
            title: "Error",
            description: "El monto del abono no puede ser mayor al saldo pendiente",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Para abono, sumamos el monto al montoPagado existente
        dataToSend.montoPagado = (pagoExistente.montoPagado || 0) + formData.monto
      }

      // Si es día único, establecer plan especial
      if (tipo === "diaUnico") {
        dataToSend.plan = "diaUnico"
        dataToSend.montoPagado = formData.monto
        dataToSend.fechaFin = formData.fecha // Mismo día
      }

      // Enviar datos a la API
      const url =
        tipo === "editar" && pagoExistente
          ? `/api/usuarios/${pagoExistente._id}`
          : tipo === "abono" && pagoExistente
            ? `/api/usuarios/${pagoExistente._id}`
            : `/api/usuarios/${formData.usuario}`

      const method = "PUT" // Siempre actualizamos el usuario

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al procesar el pago")
      }

      toast({
        title: "Éxito",
        description: tipo === "editar" ? "Usuario actualizado correctamente" : "Pago registrado correctamente",
      })

      // Cerrar modal y notificar
      setOpen(false)
      onPagoCreado()

      // Resetear formulario
      setFormData({
        usuario: "",
        plan: "",
        monto: 0,
        montoTotal: 0,
        montoPagado: 0,
        saldoPendiente: 0,
        fecha: new Date().toISOString().split("T")[0],
        fechaFin: "",
        metodo: "efectivo",
        estado: "pendiente",
      })
      setUsuarioSeleccionado(null)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar el pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Determinar el título del modal según el tipo
  const getTitulo = () => {
    switch (tipo) {
      case "nuevoPago":
        return "Registrar Nuevo Pago"
      case "abono":
        return "Registrar Abono"
      case "editar":
        return "Editar Pago"
      case "diaUnico":
        return "Registrar Pago de Día"
      default:
        return "Pago"
    }
  }

  // Si es un botón con texto, renderizar el botón completo
  if (buttonText) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            {buttonIcon}
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{getTitulo()}</DialogTitle>
            <DialogDescription>
              {tipo === "abono"
                ? "Registre un abono para el usuario seleccionado."
                : tipo === "diaUnico"
                  ? "Registre un pago por día único."
                  : "Complete los datos para registrar el pago."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Select
                value={formData.usuario}
                onValueChange={(value) => handleSelectChange("usuario", value)}
                disabled={tipo === "abono" || tipo === "editar"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario._id} value={usuario._id}>
                      {usuario.nombre} - {usuario.cedula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {usuarioSeleccionado && usuarioSeleccionado.plan && (
                <div className="text-xs text-muted-foreground mt-1">
                  Plan actual: {usuarioSeleccionado.plan.nombre} - Pagado:{" "}
                  {formatCOP(usuarioSeleccionado.montoPagado || 0)} de {formatCOP(usuarioSeleccionado.plan.precio)}
                </div>
              )}
            </div>

            {tipo !== "diaUnico" && (
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => handleSelectChange("plan", value)}
                  disabled={tipo === "abono" || tipo === "editar"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {planes.map((plan) => (
                      <SelectItem key={plan._id} value={plan._id}>
                        {plan.nombre} - {formatCOP(plan.precio)} - {plan.duracion} {plan.tipoDuracion}(s)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="monto">
                {tipo === "abono" ? "Monto del Abono" : tipo === "diaUnico" ? "Monto del Día" : "Monto a Pagar"}
              </Label>
              <Input id="monto" name="monto" type="number" value={formData.monto} onChange={handleInputChange} />
            </div>

            {tipo !== "diaUnico" && tipo !== "abono" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="montoTotal">Monto Total</Label>
                  <Input
                    id="montoTotal"
                    name="montoTotal"
                    type="number"
                    value={formData.montoTotal}
                    onChange={handleInputChange}
                    disabled={tipo === "abono"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montoPagado">Monto Pagado</Label>
                  <Input
                    id="montoPagado"
                    name="montoPagado"
                    type="number"
                    value={formData.montoPagado}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saldoPendiente">Saldo Pendiente</Label>
                  <Input
                    id="saldoPendiente"
                    name="saldoPendiente"
                    type="number"
                    value={formData.saldoPendiente}
                    disabled
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha Inicio</Label>
                <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  name="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  disabled={tipo === "diaUnico"}
                />
              </div>
            </div>

            {tipo !== "diaUnico" && tipo !== "abono" && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="abono">Abono</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando
                </>
              ) : tipo === "editar" ? (
                "Actualizar"
              ) : tipo === "abono" ? (
                "Registrar Abono"
              ) : (
                "Registrar Pago"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Si no hay texto, es solo un botón de icono (para acciones en tabla)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="flex md:hidden">
          {buttonIcon}
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          {buttonIcon}
          <span className="sr-only">{buttonText || "Acción"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>{getTitulo()}</DialogTitle>
          <DialogDescription>
            {tipo === "abono"
              ? "Registre un abono para el usuario seleccionado."
              : "Complete los datos para registrar el pago."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuario</Label>
            <Select
              value={formData.usuario}
              onValueChange={(value) => handleSelectChange("usuario", value)}
              disabled={tipo === "abono" || tipo === "editar"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario._id} value={usuario._id}>
                    {usuario.nombre} - {usuario.cedula}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {usuarioSeleccionado && usuarioSeleccionado.plan && (
              <div className="text-xs text-muted-foreground mt-1">
                Plan actual: {usuarioSeleccionado.plan.nombre} - Pagado:{" "}
                {formatCOP(usuarioSeleccionado.montoPagado || 0)} de {formatCOP(usuarioSeleccionado.plan.precio)}
              </div>
            )}
          </div>

          {tipo !== "diaUnico" && (
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => handleSelectChange("plan", value)}
                disabled={tipo === "abono" || tipo === "editar"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {planes.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.nombre} - {formatCOP(plan.precio)} - {plan.duracion} {plan.tipoDuracion}(s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="monto">{tipo === "abono" ? "Monto del Abono" : "Monto a Pagar"}</Label>
            <Input id="monto" name="monto" type="number" value={formData.monto} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha Inicio</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                name="fechaFin"
                type="date"
                value={formData.fechaFin}
                onChange={handleInputChange}
                disabled={tipo === "diaUnico"}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando
              </>
            ) : tipo === "abono" ? (
              "Registrar Abono"
            ) : (
              "Registrar Pago"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
