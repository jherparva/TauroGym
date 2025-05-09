//C:\Users\jhon\Music\TauroGym\app\api\usuarios\[id]\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import User from "../../../../models/User"
import Plan from "../../../../models/Plan"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("GET usuario con ID:", params.id)
    await dbConnect()

    const userId = params.id
    const user = await User.findById(userId).populate("plan")

    if (!user) {
      console.log("Usuario no encontrado:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error en GET:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("PUT usuario con ID:", params.id)
    await dbConnect()

    const userId = params.id
    const body = await req.json()
    console.log("Datos recibidos:", body)

    const currentUser = await User.findById(userId).populate("plan")
    if (!currentUser) {
      console.log("Usuario no encontrado para actualizar:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const planChanged = currentUser.plan?._id?.toString() !== body.plan
    const updateData: any = {}

    // Copiar todos los campos actualizables
    if (body.cedula !== undefined) updateData.cedula = body.cedula
    if (body.nombre !== undefined) updateData.nombre = body.nombre
    if (body.email !== undefined) updateData.email = body.email
    if (body.telefono !== undefined) updateData.telefono = body.telefono
    if (body.direccion !== undefined) updateData.direccion = body.direccion

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

    console.log("Datos a actualizar:", updateData)

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("plan")
    console.log("Usuario actualizado correctamente")

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error en PUT:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("DELETE usuario con ID:", params.id)
    await dbConnect()

    const userId = params.id
    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
      console.log("Usuario no encontrado para eliminar:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Usuario eliminado correctamente")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en DELETE:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}

