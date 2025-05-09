import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { decrypt } from "../../../../lib/auth"
import dbConnect from "../../../../lib/mongodb"
import { Admin } from "../../../../lib/models"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    console.log("Verificando sesión de usuario")

    // Mantener el await para consistencia
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      console.log("No se encontró cookie de sesión")
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const payload = await decrypt(session)

    if (!payload || !payload.id) {
      console.log("Sesión inválida o expirada")
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 })
    }

    await dbConnect()

    // Asegurarse de que el ID sea una cadena
    const userId = typeof payload.id === "string" ? payload.id : String(payload.id)

    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("ID inválido:", userId)
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 })
    }

    const admin = await Admin.findById(userId).select("-password")

    if (!admin) {
      console.log("Usuario no encontrado con ID:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Sesión verificada para usuario:", admin.cedula)

    // Crear respuesta con headers CORS
    const response = NextResponse.json({
      user: {
        id: admin._id.toString(),
        cedula: admin.cedula,
        nombre: admin.nombre,
        rol: admin.rol,
        estado: admin.estado,
      },
    })

    // Agregar headers CORS explícitamente
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    )

    return response
  } catch (error) {
    console.error("Error al obtener información del usuario:", error)
    return NextResponse.json({ error: "Error al obtener información del usuario" }, { status: 500 })
  }
}

// Agregar manejador OPTIONS para CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 })

  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
  response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  )

  return response
}
