export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import mongoose from "mongoose"

// Definir un esquema para la configuración
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

    // Obtener configuración de WhatsApp de la base de datos
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)
    const whatsappConfig = await Config.findOne({ key: "whatsapp" })

    if (!whatsappConfig) {
      return NextResponse.json({
        enabled: false,
        accountSid: "",
        authToken: "",
        fromNumber: "",
        porcentajeAlerta: "90",
        mensajeTemplate:
          "Hola {nombre}, tu plan en TauroGYM está por vencer. Te quedan {diasRestantes} días. ¡Renueva pronto para seguir disfrutando de nuestros servicios!",
      })
    }

    return NextResponse.json(whatsappConfig.value)
  } catch (error) {
    console.error("Error en GET /api/config/whatsapp:", error)
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
    if (body.enabled && (!body.accountSid || !body.authToken || !body.fromNumber)) {
      return NextResponse.json({ error: "Faltan campos requeridos para activar las notificaciones" }, { status: 400 })
    }

    // Guardar configuración en la base de datos
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)
    await Config.findOneAndUpdate(
      { key: "whatsapp" },
      {
        key: "whatsapp",
        value: {
          enabled: body.enabled,
          accountSid: body.accountSid,
          authToken: body.authToken,
          fromNumber: body.fromNumber,
          porcentajeAlerta: body.porcentajeAlerta || "90",
          mensajeTemplate:
            body.mensajeTemplate ||
            "Hola {nombre}, tu plan en TauroGYM está por vencer. Te quedan {diasRestantes} días.",
        },
        updatedAt: new Date(),
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en POST /api/config/whatsapp:", error)
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 })
  }
}
