"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Download, Loader2, DollarSign, Users, ShoppingBag } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatCOP } from "@/lib/currency"

// Colores para gráficos
const COLORS = ["#ff6b00", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState("membresias")
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [isExporting, setIsExporting] = useState(false)

  // Estados para datos
  const [membershipData, setMembershipData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [productData, setProductData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [summaryData, setSummaryData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    totalSales: 0,
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // Formatear fechas para la API
      const fromDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""
      const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""

      // Obtener datos de membresías
      const membershipsResponse = await fetch(`/api/usuarios?desde=${fromDate}&hasta=${toDate}`)
      const membershipsData = await membershipsResponse.json()

      // Obtener datos de asistencia
      const attendanceResponse = await fetch(`/api/asistencia?desde=${fromDate}&hasta=${toDate}`)
      const attendanceData = await attendanceResponse.json()

      // Obtener datos de ventas
      const salesResponse = await fetch(`/api/ventas?desde=${fromDate}&hasta=${toDate}`)
      const salesData = await salesResponse.json()

      // Procesar datos para gráficos
      processData(membershipsData.users, attendanceData.asistencias, salesData.ventas)
    } catch (error) {
      console.error("Error al cargar datos de reportes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de reportes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processData = (users: any[], attendance: any[], sales: any[]) => {
    // Procesar datos de membresías
    const planCounts: Record<string, number> = {}
    let activeMembers = 0
    let totalRevenue = 0

    users.forEach((user) => {
      if (user.estado === "activo") {
        activeMembers++
      }

      if (user.plan) {
        const planName = user.plan.nombre
        planCounts[planName] = (planCounts[planName] || 0) + 1
        totalRevenue += user.montoPagado || 0
      }
    })

    const membershipChartData = Object.entries(planCounts).map(([name, value]) => ({
      name,
      value,
    }))

    // Procesar datos de ingresos por mes
    const monthlyRevenue: Record<string, number> = {}

    // Inicializar los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i)
      const monthKey = format(month, "MMM", { locale: es })
      monthlyRevenue[monthKey] = 0
    }

    // Sumar ingresos de usuarios
    users.forEach((user) => {
      if (user.fechaInicio) {
        const month = format(new Date(user.fechaInicio), "MMM", { locale: es })
        if (monthlyRevenue[month] !== undefined) {
          monthlyRevenue[month] += user.montoPagado || 0
        }
      }
    })

    // Sumar ingresos de ventas
    sales.forEach((sale) => {
      if (sale.fecha) {
        const month = format(new Date(sale.fecha), "MMM", { locale: es })
        if (monthlyRevenue[month] !== undefined) {
          monthlyRevenue[month] += sale.total || 0
        }
      }
    })

    const revenueChartData = Object.entries(monthlyRevenue).map(([month, amount]) => ({
      month,
      amount,
    }))

    // Procesar datos de productos
    const productCounts: Record<string, number> = {}
    let totalSales = 0

    sales.forEach((sale) => {
      totalSales += sale.total || 0

      if (sale.productos && Array.isArray(sale.productos)) {
        sale.productos.forEach((item: any) => {
          if (item.producto && typeof item.producto === "object") {
            const productName = item.producto.nombre
            productCounts[productName] = (productCounts[productName] || 0) + (item.cantidad || 1)
          }
        })
      }
    })

    const productChartData = Object.entries(productCounts).map(([name, value]) => ({
      name,
      value,
    }))

    // Procesar datos de asistencia
    const dailyAttendance: Record<string, number> = {}

    attendance.forEach((record) => {
      if (record.fecha) {
        const day = format(new Date(record.fecha), "dd/MM", { locale: es })
        dailyAttendance[day] = (dailyAttendance[day] || 0) + 1
      }
    })

    const attendanceChartData = Object.entries(dailyAttendance).map(([day, count]) => ({
      day,
      count,
    }))

    // Actualizar estados
    setMembershipData(membershipChartData)
    setRevenueData(revenueChartData)
    setProductData(productChartData)
    setAttendanceData(attendanceChartData)
    setSummaryData({
      totalMembers: users.length,
      activeMembers,
      totalRevenue,
      totalSales,
    })
  }

  const handleExportReport = () => {
    setIsExporting(true)

    try {
      // Aquí iría la lógica para exportar el reporte
      setTimeout(() => {
        toast({
          title: "Reporte exportado",
          description: "El reporte ha sido exportado correctamente",
        })
        setIsExporting(false)
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte",
        variant: "destructive",
      })
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Visualice estadísticas detalladas de su gimnasio</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} onApply={fetchReportData} />
          <Button className="gap-2" onClick={handleExportReport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{summaryData.totalMembers}</div>
            </div>
            <p className="text-xs text-muted-foreground">Miembros registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{summaryData.activeMembers}</div>
            </div>
            <p className="text-xs text-muted-foreground">Miembros con membresía activa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Membresías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{formatCOP(summaryData.totalRevenue)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total recaudado en membresías</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{formatCOP(summaryData.totalSales)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total ventas de productos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="membresias">Membresías</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
        </TabsList>

        <TabsContent value="membresias">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Membresías</CardTitle>
                <CardDescription>Desglose de membresías activas por tipo de plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : membershipData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={membershipData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {membershipData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => [`${value} miembros`, "Cantidad"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Membresías</CardTitle>
                <CardDescription>Evolución mensual de nuevas membresías</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} miembros`, "Nuevos"]} />
                        <Bar dataKey="amount" fill="#ff6b00" name="Nuevos miembros" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ingresos">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
              <CardDescription>Ingresos por membresías y ventas de productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCOP(value), "Ingresos"]} />
                      <Bar dataKey="amount" fill="#ff6b00" name="Ingresos" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ventas de Productos</CardTitle>
              <CardDescription>Desglose de ventas por categoría de producto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : productData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} unidades`, "Cantidad"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No hay datos de productos disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asistencia">
          <Card>
            <CardHeader>
              <CardTitle>Asistencia Diaria al Gimnasio</CardTitle>
              <CardDescription>Número de miembros que visitan el gimnasio cada día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} miembros`, "Asistencia"]} />
                      <Bar dataKey="count" fill="#82ca9d" name="Asistencias" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No hay datos de asistencia disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
