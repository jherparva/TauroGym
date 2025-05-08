import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import User from "../../../../models/User"
import Plan from "../../../../models/Plan"

export async function GET(req: NextRequest, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    const { params } = await contextPromise
    const userId = params.id
    const user = await User.findById(userId).populate("plan")

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error en GET:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    const { params } = await contextPromise
    const userId = params.id
    const body = await req.json()

    const currentUser = await User.findById(userId).populate("plan")
    if (!currentUser) {
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

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("plan")

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error en PUT:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    const { params } = await contextPromise
    const userId = params.id

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en DELETE:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
