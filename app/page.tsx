"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { MetricsCard } from "../components/metrics-card"
import { StatsChart } from "../components/stats-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Avatar } from "../components/ui/avatar"
import { ChevronDown, Eye } from 'lucide-react'
import { formatCOP } from "../lib/currency"
import { UserDetailModal } from "../components/user-detail-modal"
import { DateRangePicker } from "../components/date-range-picker"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { addDays, format, subDays } from "date-fns"
import { es } from "date-fns/locale"

// Tipos para los datos
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeMembers: 0,
    monthlyRevenue: 0,
    expiringMemberships: 0,
  })
  const [recentMembers, setRecentMembers] = useState<User[]>([])
  const [membershipData, setMembershipData] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Estado para el filtro de fechas
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Función para formatear fechas en español
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Función para formatear el rango de fechas para mostrar
  const formatDateRange = () => {
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(dateRange.to, "dd/MM/yyyy", {
      locale: es,
    })}`
  }

  // Función para abrir el modal de detalles de usuario
  const openUserDetail = async (userId: string) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setSelectedUser(userData.user)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error)
    }
  }

  // Función para aplicar el filtro de fechas
  const applyDateFilter = async () => {
    setLoading(true)
    await fetchDashboardData()
  }

  const fetchDashboardData = async () => {
    try {
      // Parámetros para el filtro de fechas
      const fromDate = format(dateRange.from, "yyyy-MM-dd")
      const toDate = format(dateRange.to, "yyyy-MM-dd")

      // Fetch active members and calculate revenue directly from users
      const usersResponse = await fetch(`/api/usuarios?estado=activo&desde=${fromDate}&hasta=${toDate}`)
      if (!usersResponse.ok) {
        throw new Error("Error al obtener usuarios")
      }

      const usersData = await usersResponse.json()
      const users = usersData.users || []

      // Calculate monthly revenue from users' montoPagado
      const monthlyRevenue = users.reduce((sum: number, user: User) => {
        // Solo considerar pagos dentro del rango de fechas
        if (user.fechaInicio) {
          const fechaInicio = new Date(user.fechaInicio)
          if (fechaInicio >= dateRange.from && fechaInicio <= dateRange.to) {
            return sum + (user.montoPagado || 0)
          }
        }
        return sum
      }, 0)

      // Calculate expiring memberships within the next week
      const today = new Date()
      const nextWeek = addDays(today, 7)

      const expiringMemberships = users.filter((user: User) => {
        if (!user.fechaFin) return false
        const expiryDate = new Date(user.fechaFin)
        return expiryDate >= today && expiryDate <= nextWeek
      }).length

      // Set stats
      setStats({
        activeMembers: users.length,
        monthlyRevenue,
        expiringMemberships,
      })

      // Get recent members (last 5)
      setRecentMembers(users.slice(0, 5))

      // Generate membership data for chart based on filtered dates
      await fetchMembershipChartData(fromDate, toDate)
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener datos para el gráfico de membresías
  const fetchMembershipChartData = async (fromDate: string, toDate: string) => {
    try {
      // Obtener estadísticas de usuarios agrupadas por mes
      const response = await fetch(`/api/usuarios/stats?desde=${fromDate}&hasta=${toDate}`)

      if (!response.ok) {
        throw new Error("Error al obtener estadísticas de usuarios")
      }

      const data = await response.json()

      // Si la API devuelve datos formateados para el gráfico, úsalos
      if (data.membershipData) {
        setMembershipData(data.membershipData)
        return
      }

      // Si no, generamos datos de ejemplo
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const membershipGrowth = months.map((month, index) => ({
        date: month,
        value: Math.floor(Math.random() * 30) + 40 + index * 2,
      }))

      setMembershipData(membershipGrowth)
    } catch (error) {
      console.error("Error al obtener datos para el gráfico:", error)

      // Datos de respaldo en caso de error
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const membershipGrowth = months.map((month, index) => ({
        date: month,
        value: Math.floor(Math.random() * 30) + 40 + index * 2,
      }))

      setMembershipData(membershipGrowth)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Panel de Control</h1>
            <div className="text-sm text-muted-foreground">{formatDateRange()}</div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                Filtrar por Fecha
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} onApply={applyDateFilter} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <MetricsCard
            title="Miembros Activos"
            value={loading ? "Cargando..." : `${stats.activeMembers}`}
            change={loading ? undefined : { value: "+5", percentage: "+7.2%", isPositive: true }}
          />
          <MetricsCard
            title="Ingresos Mensuales"
            value={loading ? "Cargando..." : formatCOP(stats.monthlyRevenue)}
            change={loading ? undefined : { value: "+$340.000", percentage: "+6.1%", isPositive: true }}
          />
          <MetricsCard
            title="Membresías por Vencer"
            value={loading ? "Cargando..." : `${stats.expiringMemberships}`}
            change={loading ? undefined : { value: "-3", percentage: "-20%", isPositive: true }}
          />
        </div>
        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Estadísticas de Membresías</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDateRange({
                    from: new Date(),
                    to: new Date(),
                  })
                  setTimeout(applyDateFilter, 100)
                }}
              >
                Hoy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDateRange({
                    from: subDays(new Date(), 7),
                    to: new Date(),
                  })
                  setTimeout(applyDateFilter, 100)
                }}
              >
                Última semana
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDateRange({
                    from: subDays(new Date(), 30),
                    to: new Date(),
                  })
                  setTimeout(applyDateFilter, 100)
                }}
              >
                Último mes
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDateRange({
                    from: subDays(new Date(), 180),
                    to: new Date(),
                  })
                  setTimeout(applyDateFilter, 100)
                }}
              >
                Últimos 6 meses
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date()
                  setDateRange({
                    from: new Date(today.getFullYear(), 0, 1),
                    to: new Date(),
                  })
                  setTimeout(applyDateFilter, 100)
                }}
              >
                Año
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <p>Cargando datos...</p>
            </div>
          ) : (
            <StatsChart data={membershipData} title="Miembros" valueLabel="Miembros" />
          )}
        </Card>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Miembros Recientes</h2>
          {loading ? (
            <div className="text-center py-8">Cargando miembros...</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Miembro</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Monto Pagado</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Fecha Fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMembers.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
                                {member.nombre ? member.nombre.charAt(0) : "U"}
                              </div>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.nombre || "Usuario"}</div>
                              <div className="text-xs text-muted-foreground">{member.cedula || "Sin cédula"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.plan ? member.plan.nombre : "Sin plan"}</TableCell>
                        <TableCell>{formatCOP(member.montoPagado || 0)}</TableCell>
                        <TableCell>{formatDate(member.fechaInicio)}</TableCell>
                        <TableCell>{formatDate(member.fechaFin)}</TableCell>
                        <TableCell>
                          <Badge variant={member.estado === "activo" ? "default" : "destructive"}>
                            {member.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openUserDetail(member._id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Modal de detalles de usuario */}
        {selectedUser && (
          <UserDetailModal user={selectedUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </>
  )
}
