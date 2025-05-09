import type { NextRequest } from "next/server"
import { User, Plan } from "../../../../lib/models"
import { apiHandler, logActivity } from "../../../../lib/api-utils"

// GET - Obtener un usuario por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(
    req,
    async () => {
      const userId = params.id
      const user = await User.findById(userId).populate("plan")

      if (!user) {
        throw new Error("Usuario no encontrado")
      }

      return { user }
    },
    params,
    { errorMessage: "Error al obtener usuario" },
  )
}

// PUT - Actualizar un usuario por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(
    req,
    async (req) => {
      const userId = params.id
      const body = await req.json()

      const currentUser = await User.findById(userId).populate("plan")
      if (!currentUser) {
        throw new Error("Usuario no encontrado")
      }

      const planChanged = currentUser.plan?._id?.toString() !== body.plan
      const updateData: any = {}

      // Actualizar campos básicos si están presentes
      if (body.cedula) updateData.cedula = body.cedula
      if (body.nombre) updateData.nombre = body.nombre
      if (body.email) updateData.email = body.email
      if (body.telefono) updateData.telefono = body.telefono
      if (body.direccion) updateData.direccion = body.direccion
      if (body.fechaNacimiento) updateData.fechaNacimiento = body.fechaNacimiento
      if (body.estado) updateData.estado = body.estado

      // Manejar plan y fechas
      if (body.plan) {
        if (body.plan === "diaUnico") {
          updateData.fechaInicio = body.fechaInicio || new Date()
          updateData.fechaFin = body.fechaInicio || new Date()
          // Para día único, no asignamos un plan real
          updateData.plan = null
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

      // Actualizar fechas y monto pagado
      if (body.fechaInicio) updateData.fechaInicio = body.fechaInicio
      if (body.fechaFin) updateData.fechaFin = body.fechaFin
      if (body.montoPagado !== undefined) updateData.montoPagado = Number(body.montoPagado)

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("plan")

      // Registrar actividad
      logActivity("admin", "actualizar_usuario", `Usuario actualizado: ${updatedUser.nombre}`)

      return { user: updatedUser }
    },
    params,
    { errorMessage: "Error al actualizar usuario" },
  )
}

// DELETE - Eliminar un usuario por ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(
    req,
    async () => {
      const userId = params.id

      const user = await User.findById(userId)
      if (!user) {
        throw new Error("Usuario no encontrado")
      }

      const deletedUser = await User.findByIdAndDelete(userId)

      // Registrar actividad
      logActivity("admin", "eliminar_usuario", `Usuario eliminado: ${user.nombre}`)

      return { success: true, message: "Usuario eliminado correctamente" }
    },
    params,
    { errorMessage: "Error al eliminar usuario" },
  )
}
