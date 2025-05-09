import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import User from "../../../../models/User"
import Plan from "../../../../models/Plan"

// Función para configurar los headers CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

// Manejador para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }))
}

export async function GET(req: NextRequest, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    const { params } = await contextPromise
    const userId = params.id
    const user = await User.findById(userId).populate("plan")

    if (!user) {
      return setCorsHeaders(NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }))
    }

    return setCorsHeaders(NextResponse.json({ user }))
  } catch (error) {
    console.error("Error en GET:", error)
    return setCorsHeaders(NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 }))
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
      return setCorsHeaders(NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }))
    }

    const planChanged = currentUser.plan?._id?.toString() !== body.plan
    const updateData: any = {}

    // Actualizar los campos que vienen en el body
    if (body.cedula) updateData.cedula = body.cedula
    if (body.nombre) updateData.nombre = body.nombre
    if (body.email) updateData.email = body.email
    if (body.telefono) updateData.telefono = body.telefono
    if (body.direccion) updateData.direccion = body.direccion
    if (body.fechaNacimiento) updateData.fechaNacimiento = body.fechaNacimiento
    if (body.estado) updateData.estado = body.estado

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

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("plan")

    return setCorsHeaders(NextResponse.json({ user: updatedUser }))
  } catch (error) {
    console.error("Error en PUT:", error)
    return setCorsHeaders(NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 }))
  }
}

export async function DELETE(req: NextRequest, contextPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    const { params } = await contextPromise
    const userId = params.id

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return setCorsHeaders(NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }))
    }

    return setCorsHeaders(NextResponse.json({ success: true }))
  } catch (error) {
    console.error("Error en DELETE:", error)
    return setCorsHeaders(NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 }))
  }
}
