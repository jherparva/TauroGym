import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { isAuthenticated } from "../../../../lib/auth"
import mongoose from "mongoose"


export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await isAuthenticated(req)
    if (!authResult.success) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()

    // Validar datos
    if (!body.userId) {
      return NextResponse.json({ error: "Se requiere el ID del usuario" }, { status: 400 })
    }

    // Obtener usuario
    const user = await User.findById(body.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener configuración de WhatsApp
    const ConfigSchema = new mongoose.Schema({
      key: { type: String, required: true, unique: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
      updatedAt: { type: Date, default: Date.now },
    })
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)
    const whatsappConfig = await Config.findOne({ key: "whatsapp" })

    if (!whatsappConfig || !whatsappConfig.value.enabled) {
      return NextResponse.json({ error: "Las notificaciones de WhatsApp no están habilitadas" }, { status: 400 })
    }

    const config = whatsappConfig.value

    // Verificar que el usuario tenga número de teléfono
    if (!user.telefono) {
      return NextResponse.json({ error: "El usuario no tiene número de teléfono" }, { status: 400 })
    }

    // Formatear número de teléfono si es necesario
    let to = user.telefono
    if (!to.startsWith("+")) {
      to = `+${to}`
    }

    // Calcular días restantes
    const fechaActual = new Date()
    const fechaFin = new Date(user.fechaFin)
    const diasRestantes = Math.ceil((fechaFin.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24))

    // Preparar mensaje
    const mensaje = config.mensajeTemplate
      .replace("{nombre}", user.nombre)
      .replace("{diasRestantes}", diasRestantes.toString())

    // Enviar mensaje usando Twilio
    const client = require("twilio")(config.accountSid, config.authToken)

    const result = await client.messages.create({
      body: mensaje,
      from: `whatsapp:${config.fromNumber}`,
      to: `whatsapp:${to}`,
    })

    // Registrar envío de mensaje (opcional)
    // Aquí podrías guardar un registro del mensaje enviado

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      to: to,
      message: mensaje,
    })
  } catch (error: any) {
    console.error("Error en POST /api/whatsapp/send:", error)
    return NextResponse.json(
      {
        error: "Error al enviar mensaje",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
