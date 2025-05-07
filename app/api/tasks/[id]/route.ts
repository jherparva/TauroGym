export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import mongoose from "mongoose"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Extraer id de params de forma segura
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: "ID de tarea no proporcionado" }, { status: 400 })
    }

    await dbConnect()

    // Eliminar tarea
    const Task = mongoose.models.Task
    const result = await Task.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error en DELETE /api/tasks/${params?.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar tarea" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Extraer id de params de forma segura
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: "ID de tarea no proporcionado" }, { status: 400 })
    }

    await dbConnect()
    const body = await req.json()

    // Actualizar tarea
    const Task = mongoose.models.Task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!updatedTask) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, task: updatedTask })
  } catch (error) {
    console.error(`Error en PATCH /api/tasks/${params?.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar tarea" }, { status: 500 })
  }
}
