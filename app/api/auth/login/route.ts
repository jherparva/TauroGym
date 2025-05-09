import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import { Admin } from "../../../../lib/models"
import { encrypt } from "../../../../lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando proceso de login")
    await dbConnect()

    const body = await request.json()
    const { cedula, password } = body
    console.log("Intentando login para cédula:", cedula)

    // Buscar el administrador por cédula
    const admin = await Admin.findOne({ cedula })

    if (!admin) {
      console.log("Admin no encontrado para cédula:", cedula)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar la contraseña
    const isPasswordValid = await admin.comparePassword(password)

    if (!isPasswordValid) {
      console.log("Contraseña inválida para cédula:", cedula)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar que el admin esté activo
    if (admin.estado !== "activo") {
      console.log("Admin desactivado:", cedula)
      return NextResponse.json({ error: "Usuario desactivado. Contacte al administrador." }, { status: 403 })
    }

    // Crear token JWT
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    const session = await encrypt({
      id: admin._id.toString(),
      cedula: admin.cedula,
      nombre: admin.nombre,
      rol: admin.rol,
      expires,
    })

    // Configurar opciones de cookie
    const cookieOptions = {
      expires,
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    }

    // Establecer cookie de sesión - Mantener el await para consistencia
    const cookieStore = await cookies()
    cookieStore.set("session", session, cookieOptions)

    console.log("Login exitoso para:", cedula)

    // Crear respuesta con headers CORS
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin._id.toString(),
        cedula: admin.cedula,
        nombre: admin.nombre,
        rol: admin.rol,
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
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
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
