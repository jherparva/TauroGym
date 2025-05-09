import type { NextRequest } from "next/server"
import { User } from "../../../../lib/models"
import { apiHandler } from "../../../../lib/api-utils"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

// GET - Obtener estadísticas de usuarios
export async function GET(req: NextRequest) {
  return apiHandler(req, async (req) => {
    // Obtener parámetros de consulta
    const url = new URL(req.url)
    const periodo = url.searchParams.get("periodo") || "mes"

    // Calcular fechas para el período
    const hoy = new Date()
    let fechaInicio: Date
    let fechaFin: Date = hoy

    switch (periodo) {
      case "mes":
        fechaInicio = startOfMonth(hoy)
        fechaFin = endOfMonth(hoy)
        break
      case "trimestre":
        fechaInicio = startOfMonth(subMonths(hoy, 2))
        break
      case "semestre":
        fechaInicio = startOfMonth(subMonths(hoy, 5))
        break
      case "anual":
        fechaInicio = startOfMonth(subMonths(hoy, 11))
        break
      default:
        fechaInicio = startOfMonth(hoy)
        fechaFin = endOfMonth(hoy)
    }

    // Obtener estadísticas generales
    const totalUsuarios = await User.countDocuments()
    const usuariosActivos = await User.countDocuments({ estado: "activo" })
    const usuariosInactivos = await User.countDocuments({ estado: "inactivo" })

    // Obtener usuarios registrados en el período
    const usuariosNuevos = await User.countDocuments({
      createdAt: { $gte: fechaInicio, $lte: fechaFin },
    })

    // Obtener usuarios con planes activos
    const usuariosConPlan = await User.countDocuments({
      plan: { $ne: null },
      fechaFin: { $gte: hoy },
      estado: "activo",
    })

    // Obtener usuarios con planes por vencer en los próximos 7 días
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + 7)
    const usuariosPorVencer = await User.countDocuments({
      plan: { $ne: null },
      fechaFin: { $gte: hoy, $lte: fechaLimite },
      estado: "activo",
    })

    // Calcular ingresos totales
    const usuarios = await User.find().populate("plan")
    const ingresosTotales = usuarios.reduce((total, user) => total + (user.montoPagado || 0), 0)

    // Calcular ingresos pendientes
    const ingresosPendientes = usuarios.reduce((total, user) => {
      if (user.plan && user.montoPagado < user.plan.precio) {
        return total + (user.plan.precio - user.montoPagado)
      }
      return total
    }, 0)

    return {
      stats: {
        totalUsuarios,
        usuariosActivos,
        usuariosInactivos,
        usuariosNuevos,
        usuariosConPlan,
        usuariosPorVencer,
        ingresosTotales,
        ingresosPendientes,
        periodo,
        fechaInicio,
        fechaFin,
      },
    }
  })
}
