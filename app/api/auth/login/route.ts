import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import { Admin } from "../../../../lib/models"
import { encrypt } from "../../../../lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { cedula, password } = body

    // Buscar el administrador por cédula
    const admin = await Admin.findOne({ cedula })

    if (!admin) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar la contraseña
    const isPasswordValid = await admin.comparePassword(password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar que el admin esté activo
    if (admin.estado !== "activo") {
      return NextResponse.json({ error: "Usuario desactivado. Contacte al administrador." }, { status: 403 })
    }

    // Crear token JWT
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    const session = await encrypt({
      id: admin._id.toString(), // Convertir a string explícitamente
      cedula: admin.cedula,
      nombre: admin.nombre,
      rol: admin.rol,
      expires,
    })

    // Establecer cookie de sesión - Ahora con await
    const cookieStore = await cookies()
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: admin._id.toString(),
        cedula: admin.cedula,
        nombre: admin.nombre,
        rol: admin.rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
