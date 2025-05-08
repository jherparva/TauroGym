import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { decrypt } from "../../../../lib/auth"
import dbConnect from "../../../../lib/mongodb"
import { Admin } from "../../../../lib/models"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const payload = await decrypt(session)

    if (!payload || !payload.id) {
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
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: admin._id.toString(),
        cedula: admin.cedula,
        nombre: admin.nombre,
        rol: admin.rol,
        estado: admin.estado,
      },
    })
  } catch (error) {
    console.error("Error al obtener información del usuario:", error)
    return NextResponse.json({ error: "Error al obtener información del usuario" }, { status: 500 })
  }
}
