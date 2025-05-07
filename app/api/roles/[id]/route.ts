export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import mongoose from "mongoose"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Extraer id de params de forma segura
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: "ID de rol no proporcionado" }, { status: 400 })
    }

    await dbConnect()
    const body = await req.json()

    // Actualizar rol
    const Role = mongoose.models.Role
    const updatedRole = await Role.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!updatedRole) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, role: updatedRole })
  } catch (error) {
    console.error(`Error en PUT /api/roles/${params?.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar rol" }, { status: 500 })
  }
}
