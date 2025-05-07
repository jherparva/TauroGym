export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import mongoose from "mongoose"

// Reutilizamos el mismo esquema de configuración que se usa en WhatsApp
const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
})

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Obtener configuración de notificaciones del sistema de la base de datos
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)
    const systemNotificationsConfig = await Config.findOne({ key: "system-notifications" })

    if (!systemNotificationsConfig) {
      return NextResponse.json({
        enabled: false,
        emailNotifications: true,
        dashboardNotifications: true,
        lowInventoryAlert: true,
        lowInventoryThreshold: "10",
        membershipExpiryAlert: true,
        membershipExpiryDays: "7",
        dailyReportEmail: false,
        adminEmails: "",
      })
    }

    return NextResponse.json(systemNotificationsConfig.value)
  } catch (error) {
    console.error("Error en GET /api/config/system-notifications:", error)
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()

    // Validar datos
    if (body.enabled && body.emailNotifications && !body.adminEmails) {
      return NextResponse.json(
        { error: "Se requieren correos de administradores para las notificaciones por email" },
        { status: 400 },
      )
    }

    // Guardar configuración en la base de datos
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)
    await Config.findOneAndUpdate(
      { key: "system-notifications" },
      {
        key: "system-notifications",
        value: {
          enabled: body.enabled,
          emailNotifications: body.emailNotifications,
          dashboardNotifications: body.dashboardNotifications,
          lowInventoryAlert: body.lowInventoryAlert,
          lowInventoryThreshold: body.lowInventoryThreshold || "10",
          membershipExpiryAlert: body.membershipExpiryAlert,
          membershipExpiryDays: body.membershipExpiryDays || "7",
          dailyReportEmail: body.dailyReportEmail,
          adminEmails: body.adminEmails,
        },
        updatedAt: new Date(),
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en POST /api/config/system-notifications:", error)
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 })
  }
}
