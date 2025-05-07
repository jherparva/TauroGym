import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { isAuthenticated } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await isAuthenticated(req)
    if (!authResult.success) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

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
    const porcentajeAlerta = Number.parseInt(config.porcentajeAlerta) || 90

    // Fecha actual para cálculos
    const fechaActual = new Date()

    // Buscar usuarios con planes activos
    const usuarios = await User.find({
      estado: "activo",
      fechaInicio: { $lte: fechaActual },
      fechaFin: { $gte: fechaActual },
      telefono: { $exists: true, $ne: "" },
    })

    const mensajesEnviados = []
    const errores = []

    // Inicializar cliente Twilio
    const client = require("twilio")(config.accountSid, config.authToken)

    // Procesar cada usuario
    for (const user of usuarios) {
      try {
        const fechaInicio = new Date(user.fechaInicio)
        const fechaFin = new Date(user.fechaFin)

        // Calcular porcentaje de días transcurridos
        const duracionTotalMs = fechaFin.getTime() - fechaInicio.getTime()
        const transcurridoMs = fechaActual.getTime() - fechaInicio.getTime()
        const porcentajeDiasTranscurridos = Math.round((transcurridoMs / duracionTotalMs) * 100)

        // Verificar si el usuario cumple con el criterio para enviar notificación
        if (porcentajeDiasTranscurridos >= porcentajeAlerta && porcentajeDiasTranscurridos < 100) {
          // Calcular días restantes
          const diasRestantes = Math.ceil((fechaFin.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24))

          // Formatear número de teléfono
          let to = user.telefono
          if (!to.startsWith("+")) {
            to = `+${to}`
          }

          // Preparar mensaje
          const mensaje = config.mensajeTemplate
            .replace("{nombre}", user.nombre)
            .replace("{diasRestantes}", diasRestantes.toString())

          // Enviar mensaje
          const result = await client.messages.create({
            body: mensaje,
            from: `whatsapp:${config.fromNumber}`,
            to: `whatsapp:${to}`,
          })

          // Registrar envío exitoso
          mensajesEnviados.push({
            userId: user._id,
            nombre: user.nombre,
            telefono: to,
            diasRestantes,
            messageId: result.sid,
          })

          // Opcional: registrar en la base de datos que se envió un mensaje
          // para evitar enviar múltiples notificaciones al mismo usuario
        }
      } catch (error: any) {
        // Registrar error para este usuario
        errores.push({
          userId: user._id,
          nombre: user.nombre,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      mensajesEnviados,
      totalEnviados: mensajesEnviados.length,
      errores,
      totalErrores: errores.length,
    })
  } catch (error: any) {
    console.error("Error en POST /api/whatsapp/notify-expiring:", error)
    return NextResponse.json(
      {
        error: "Error al procesar notificaciones",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
