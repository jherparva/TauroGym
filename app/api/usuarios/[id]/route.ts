//C:\Users\jhon\Music\TauroGym\app\api\usuarios\[id]\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import User from "../../../../models/User"
import Plan from "../../../../models/Plan"

// Función auxiliar para obtener el ID de usuario de la URL
function getUserIdFromUrl(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathParts = url.pathname.split("/")
  return pathParts[pathParts.length - 1] || null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Iniciando GET /api/usuarios/[id]")
    await dbConnect()
    console.log("Conexión a DB establecida")

    // Obtener ID de usuario de los parámetros o de la URL
    const userId = params?.id || getUserIdFromUrl(request)
    console.log("ID de usuario:", userId)

    if (!userId) {
      console.log("Error: ID de usuario no proporcionado")
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
    }

    const user = await User.findById(userId).populate("plan")

    if (!user) {
      console.log("Error: Usuario no encontrado")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Usuario encontrado exitosamente")
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error detallado en GET /api/usuarios/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al obtener usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Iniciando PUT /api/usuarios/[id]")
    await dbConnect()
    console.log("Conexión a DB establecida")

    // Obtener ID de usuario de los parámetros o de la URL
    const userId = params?.id || getUserIdFromUrl(request)
    console.log("ID de usuario:", userId)

    if (!userId) {
      console.log("Error: ID de usuario no proporcionado")
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
    }

    const body = await request.json()
    console.log("Datos recibidos:", body)

    const currentUser = await User.findById(userId).populate("plan")
    if (!currentUser) {
      console.log("Error: usuario no encontrado")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const planChanged = currentUser.plan?._id?.toString() !== body.plan
    const updateData: any = {}

    if (body.plan) {
      if (body.plan === "diaUnico") {
        updateData.fechaInicio = body.fechaInicio || new Date()
        updateData.fechaFin = body.fechaInicio || new Date()
      } else {
        updateData.plan = body.plan
        if (planChanged) {
          const plan = await Plan.findById(body.plan)
          if (plan) {
            updateData.montoPagado = body.montoPagado || 0
          }
        }
      }
    }

    if (body.fechaInicio) updateData.fechaInicio = body.fechaInicio
    if (body.fechaFin) updateData.fechaFin = body.fechaFin
    if (body.montoPagado !== undefined) updateData.montoPagado = Number(body.montoPagado)
    if (body.estado) updateData.estado = body.estado

    // Añadir campos adicionales si están presentes
    if (body.cedula) updateData.cedula = body.cedula
    if (body.nombre) updateData.nombre = body.nombre
    if (body.email) updateData.email = body.email
    if (body.telefono) updateData.telefono = body.telefono
    if (body.direccion) updateData.direccion = body.direccion

    console.log("Actualizando usuario con datos:", updateData)
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("plan")
    console.log("Usuario actualizado exitosamente")

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error detallado en PUT /api/usuarios/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Iniciando DELETE /api/usuarios/[id]")
    await dbConnect()
    console.log("Conexión a DB establecida")

    // Obtener ID de usuario de los parámetros o de la URL
    const userId = params?.id || getUserIdFromUrl(request)
    console.log("ID de usuario a eliminar:", userId)

    if (!userId) {
      console.log("Error: ID de usuario no proporcionado")
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
    }

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      console.log("Error: usuario no encontrado para eliminar")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Usuario eliminado exitosamente")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error detallado en DELETE /api/usuarios/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al eliminar usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
