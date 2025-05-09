import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"
import Plan from "../../../models/Plan"
import { corsMiddleware } from "../../../lib/cors"

// Manejador para POST que puede realizar operaciones PUT y DELETE
export async function POST(req: NextRequest) {
  // Verificar CORS
  const corsResponse = corsMiddleware(req)
  if (corsResponse) return corsResponse

  try {
    await dbConnect()

    const body = await req.json()
    const { _method, userId, ...data } = body

    // Si es una operación de actualización (PUT)
    if (_method === "PUT" && userId) {
      const currentUser = await User.findById(userId).populate("plan")
      if (!currentUser) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      const updateData: any = {}

      // Actualizar los campos que vienen en el body
      if (data.cedula) updateData.cedula = data.cedula
      if (data.nombre) updateData.nombre = data.nombre
      if (data.email) updateData.email = data.email
      if (data.telefono) updateData.telefono = data.telefono
      if (data.direccion) updateData.direccion = data.direccion
      if (data.fechaNacimiento) updateData.fechaNacimiento = data.fechaNacimiento
      if (data.estado) updateData.estado = data.estado

      if (data.plan) {
        if (data.plan === "diaUnico") {
          updateData.fechaInicio = data.fechaInicio || new Date()
          updateData.fechaFin = data.fechaInicio || new Date()
        } else {
          updateData.plan = data.plan
          const planChanged = currentUser.plan?._id?.toString() !== data.plan
          if (planChanged) {
            const plan = await Plan.findById(data.plan)
            if (plan) {
              updateData.montoPagado = data.montoPagado || 0
            }
          }
        }
      }

      if (data.fechaInicio) updateData.fechaInicio = data.fechaInicio
      if (data.fechaFin) updateData.fechaFin = data.fechaFin
      if (data.montoPagado !== undefined) updateData.montoPagado = Number(data.montoPagado)

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("plan")

      return NextResponse.json({ user: updatedUser })
    }

    // Si es una operación de eliminación (DELETE)
    if (_method === "DELETE" && userId) {
      const deletedUser = await User.findByIdAndDelete(userId)
      if (!deletedUser) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    }

    // Si es una operación de creación (POST normal)
    // Validar datos requeridos
    if (!data.cedula || !data.nombre || !data.telefono) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: cédula, nombre y teléfono son obligatorios" },
        { status: 400 },
      )
    }

    // Verificar si ya existe un usuario con la misma cédula
    const existingUser = await User.findOne({ cedula: data.cedula })
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe un usuario con esta cédula" }, { status: 400 })
    }

    // Crear el usuario con montoPagado inicializado en 0
    const userData = {
      cedula: data.cedula,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      estado: data.estado || "activo",
      fechaNacimiento: data.fechaNacimiento,
      plan: data.plan || null,
      fechaInicio: data.fechaInicio || null,
      fechaFin: data.fechaFin || null,
      montoPagado: 0, // Inicializar montoPagado en 0
    }

    const user = await User.create(userData)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Error en POST:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
