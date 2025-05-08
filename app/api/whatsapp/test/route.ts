import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "../../../../lib/auth"

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await isAuthenticated(req)
    if (!authResult.success) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Validar datos
    if (!body.to || !body.accountSid || !body.authToken || !body.fromNumber || !body.message) {
      return NextResponse.json({ error: "Faltan campos requeridos para enviar el mensaje" }, { status: 400 })
    }

    // Formatear número de teléfono si es necesario
    let to = body.to
    if (!to.startsWith("+")) {
      to = `+${to}`
    }

    // Enviar mensaje de prueba usando Twilio
    const client = require("twilio")(body.accountSid, body.authToken)

    await client.messages.create({
      body: body.message,
      from: `whatsapp:${body.fromNumber}`,
      to: `whatsapp:${to}`,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error en POST /api/whatsapp/test:", error)
    return NextResponse.json(
      {
        error: "Error al enviar mensaje de prueba",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
