//C:\Users\jhon\Music\TauroGym\app\usuarios\page.tsx
"use client"

import { useState, useEffect } from "react"
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns"
import { toast } from "../../components/ui/use-toast"
import { UserHeader } from "../../components/usuarios/user-header"
import { UserStats } from "../../components/usuarios/user-stats"
import { UserActions } from "../../components/usuarios/user-actions"
import { UserSearch } from "../../components/usuarios/user-search"
import { UserTable } from "../../components/usuarios/user-table"
import { UserEditDialog } from "../../components/usuarios/user-edit-dialog"
import { UserViewDialog } from "../../components/usuarios/user-view-dialog"

// Interfaces
interface Usuario {
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
}

// Tipo para usuario con información de pago
interface UsuarioConPago extends Usuario {
  infoPago?: {
    montoPagado: number
    saldoPendiente: number
    porcentajePago: number
    porcentajeDiasTranscurridos?: number
    diasRestantes?: number
  }
}

export default function UsuariosPage() {
  // Estados para usuarios
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UsuarioConPago[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<UsuarioConPago | null>(null)
  const [viewUser, setViewUser] = useState<UsuarioConPago | null>(null)
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

  // Estados para filtros
  const [fechaInicio, setFechaInicio] = useState<Date>(startOfMonth(new Date()))
  const [fechaFin, setFechaFin] = useState<Date>(endOfMonth(new Date()))
  const [mesActual, setMesActual] = useState<Date>(new Date())

  // Funciones para usuarios
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch(`/api/usuarios${searchQuery ? `?query=${searchQuery}` : ""}`)
      if (!response.ok) throw new Error("Error al cargar usuarios")
      const data = await response.json()

      // Verificar que data.users existe y es un array
      if (!data.users || !Array.isArray(data.users)) {
        console.error("Respuesta de API inválida:", data)
        toast({
          title: "Error",
          description: "Formato de respuesta inválido al cargar usuarios",
          variant: "destructive",
        })
        setUsers([])
      } else {
        // Fecha actual para cálculos
        const fechaActual = new Date()

        // Procesar usuarios con información de pagos y progreso del plan
        const usuariosConPagos = data.users.map((user: Usuario) => {
          // Calcular totales de pago
          const montoPagadoTotal = user.montoPagado || 0
          const montoTotalPlan = user.plan?.precio || 0

          // Calcular saldo pendiente y porcentaje de pago
          const saldoPendiente = Math.max(0, montoTotalPlan - montoPagadoTotal)
          const porcentajePago =
            montoTotalPlan > 0 ? Math.min(100, Math.round((montoPagadoTotal / montoTotalPlan) * 100)) : 0

          // Calcular porcentaje de días transcurridos del plan
          let porcentajeDiasTranscurridos = 0
          let diasRestantes = 0

          if (user.fechaInicio && user.fechaFin) {
            const fechaInicio = new Date(user.fechaInicio)
            const fechaFin = new Date(user.fechaFin)

            // Solo calcular si el plan está activo (fecha actual entre inicio y fin)
            if (fechaActual >= fechaInicio && fechaActual <= fechaFin) {
              const duracionTotalMs = fechaFin.getTime() - fechaInicio.getTime()
              const transcurridoMs = fechaActual.getTime() - fechaInicio.getTime()

              // Calcular porcentaje de días transcurridos
              porcentajeDiasTranscurridos = Math.round((transcurridoMs / duracionTotalMs) * 100)

              // Calcular días restantes
              diasRestantes = Math.ceil((fechaFin.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24))
            }
          }

          return {
            ...user,
            infoPago: {
              montoPagado: montoPagadoTotal,
              saldoPendiente,
              porcentajePago,
              porcentajeDiasTranscurridos,
              diasRestantes,
            },
          }
        })

        // Ordenar usuarios: primero los que tienen ≥90% de días transcurridos
        const usuariosOrdenados = [...usuariosConPagos].sort((a, b) => {
          const aAlerta =
            (a.infoPago?.porcentajeDiasTranscurridos || 0) >= 90 &&
            (a.infoPago?.porcentajeDiasTranscurridos || 0) < 100 &&
            a.estado === "activo"
          const bAlerta =
            (b.infoPago?.porcentajeDiasTranscurridos || 0) >= 90 &&
            (b.infoPago?.porcentajeDiasTranscurridos || 0) < 100 &&
            b.estado === "activo"

          if (aAlerta && !bAlerta) return -1
          if (!aAlerta && bAlerta) return 1
          return 0
        })

        setUsers(usuariosOrdenados)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/planes?estado=activo")
      if (!response.ok) throw new Error("Error al cargar planes")
      const data = await response.json()

      if (!data.planes || !Array.isArray(data.planes)) {
        console.error("Respuesta de API inválida para planes:", data)
        setPlans([])
      } else {
        setPlans(data.planes)
      }
    } catch (error) {
      console.error("Error:", error)
      setPlans([])
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este usuario?")) return

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      // Actualizar la lista de usuarios
      await fetchUsers()

      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar usuario",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: UsuarioConPago) => {
    setCurrentUser(user)
    setFormData({
      cedula: user.cedula || "",
      nombre: user.nombre || "",
      email: user.email || "",
      telefono: user.telefono || "",
      direccion: user.direccion || "",
      estado: user.estado || "activo",
      plan: user.plan?._id || "",
      fechaInicio: user.fechaInicio ? new Date(user.fechaInicio).toISOString().split("T")[0] : "",
      fechaFin: user.fechaFin ? new Date(user.fechaFin).toISOString().split("T")[0] : "",
    })
  }

  const openViewDialog = (user: UsuarioConPago) => {
    setViewUser(user)
  }

  // Función para registrar un abono
  const handleAbonoUser = async (userId: string, montoAbono: number) => {
    try {
      // Primero obtenemos los datos actuales del usuario
      const response = await fetch(`/api/usuarios/${userId}`)
      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario")
      }

      const userData = await response.json()
      const user = userData.user

      if (!user) {
        throw new Error("No se encontró el usuario")
      }

      // Calcular nuevo monto pagado
      const nuevoMontoPagado = (user.montoPagado || 0) + montoAbono

      // Actualizar el usuario con el nuevo monto pagado
      await fetch(`/api/usuarios/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          montoPagado: nuevoMontoPagado,
        }),
      })

      // Recargar usuarios
      await fetchUsers()

      toast({
        title: "Éxito",
        description: "Abono registrado correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al registrar el abono",
        variant: "destructive",
      })
    }
  }

  // Cambiar mes para filtro
  const cambiarMes = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = direccion === "anterior" ? subMonths(mesActual, 1) : addMonths(mesActual, 1)

    setMesActual(nuevaFecha)
    setFechaInicio(startOfMonth(nuevaFecha))
    setFechaFin(endOfMonth(nuevaFecha))
  }

  // Restablecer filtros al mes actual
  const restablecerFiltros = () => {
    const hoy = new Date()
    setMesActual(hoy)
    setFechaInicio(startOfMonth(hoy))
    setFechaFin(endOfMonth(hoy))
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers()
    fetchPlans()
  }, [])

  // Actualizar búsqueda de usuarios
  useEffect(() => {
    // Debounce para la búsqueda automática
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Filtrar usuarios por fecha
  const usuariosFiltrados = users.filter((user) => {
    if (!user.fechaInicio) return true

    const fechaUsuario = new Date(user.fechaInicio)
    return fechaUsuario >= fechaInicio && fechaUsuario <= fechaFin
  })

  // Calcular totales
  const totalUsuariosActivos = usuariosFiltrados.filter((u) => u.estado === "activo").length
  const totalIngresos = usuariosFiltrados.reduce((suma, user) => suma + (user.montoPagado || 0), 0)
  const totalPendiente = usuariosFiltrados.reduce((suma, user) => suma + (user.infoPago?.saldoPendiente || 0), 0)
  const usuariosConAbono = usuariosFiltrados.filter(
    (u) => u.montoPagado > 0 && u.plan && u.montoPagado < u.plan.precio,
  ).length

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Encabezado principal */}
      <UserHeader />

      {/* Sección de estadísticas */}
      <UserStats
        totalUsuariosActivos={totalUsuariosActivos}
        totalIngresos={totalIngresos}
        totalPendiente={totalPendiente}
        usuariosConAbono={usuariosConAbono}
      />

      {/* Sección de acciones principales */}
      <UserActions fetchUsers={fetchUsers} loadingUsers={loadingUsers} plans={plans} onPagoCreado={fetchUsers} />

      {/* Sección de búsqueda y filtros */}
      <UserSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mesActual={mesActual}
        cambiarMes={cambiarMes}
        restablecerFiltros={restablecerFiltros}
      />

      {/* Tabla de usuarios */}
      <UserTable
        loadingUsers={loadingUsers}
        usuariosFiltrados={usuariosFiltrados}
        openViewDialog={openViewDialog}
        openEditDialog={openEditDialog}
        handleDeleteUser={handleDeleteUser}
      />

      {/* Dialog para editar usuario */}
      <UserEditDialog
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        formData={formData}
        setFormData={setFormData}
        plans={plans}
        fetchUsers={fetchUsers}
      />

      {/* Dialog para ver detalles del usuario */}
      <UserViewDialog
        viewUser={viewUser}
        setViewUser={setViewUser}
        openEditDialog={openEditDialog}
        handleAbonoUser={handleAbonoUser}
      />
    </div>
  )
}
