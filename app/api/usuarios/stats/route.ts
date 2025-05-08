import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { format, parse, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Obtener parámetros de consulta
    const url = new URL(req.url)
    const desde = url.searchParams.get("desde")
    const hasta = url.searchParams.get("hasta")

    // Convertir fechas
    const fromDate = desde ? new Date(desde) : new Date(new Date().getFullYear(), 0, 1) // Desde el inicio del año actual
    const toDate = hasta ? new Date(hasta) : new Date() // Hasta hoy

    // Obtener todos los usuarios activos
    const users = await User.find({
      estado: "activo",
      fechaInicio: { $gte: fromDate, $lte: toDate },
    }).populate("plan")

    // Agrupar usuarios por mes de inicio
    const usersByMonth: Record<string, { count: number; revenue: number }> = {}

    // Inicializar todos los meses en el rango
    let currentDate = startOfMonth(fromDate)
    while (currentDate <= toDate) {
      const monthKey = format(currentDate, "MMM", { locale: es })
      usersByMonth[monthKey] = { count: 0, revenue: 0 }
      currentDate = startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    // Contar usuarios y sumar ingresos por mes
    users.forEach((user) => {
      if (user.fechaInicio) {
        const fechaInicio = new Date(user.fechaInicio)
        const monthKey = format(fechaInicio, "MMM", { locale: es })

        if (usersByMonth[monthKey]) {
          usersByMonth[monthKey].count += 1
          usersByMonth[monthKey].revenue += user.montoPagado || 0
        }
      }
    })

    // Convertir a formato para gráfico
    const membershipData = Object.entries(usersByMonth).map(([date, data]) => ({
      date,
      value: data.count,
      revenue: data.revenue,
    }))

    // Ordenar por fecha
    membershipData.sort((a, b) => {
      const monthA = parse(a.date, "MMM", new Date(), { locale: es }).getMonth()
      const monthB = parse(b.date, "MMM", new Date(), { locale: es }).getMonth()
      return monthA - monthB
    })

    return NextResponse.json({
      membershipData,
      totalUsers: users.length,
      totalRevenue: users.reduce((sum, user) => sum + (user.montoPagado || 0), 0),
    })
  } catch (error) {
    console.error("Error en GET /api/usuarios/stats:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas de usuarios" }, { status: 500 })
  }
}
