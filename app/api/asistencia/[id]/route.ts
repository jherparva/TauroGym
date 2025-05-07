//C:\Users\jhon\Downloads\tauroGYM1\app\api\asistencia\[id]\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const asistencia = await Attendance.findByIdAndUpdate(params.id, body, { new: true })

    if (!asistencia) {
      return NextResponse.json({ error: "Registro de asistencia no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ asistencia }, { status: 200 })
  } catch (error) {
    console.error("Error al actualizar asistencia:", error)
    return NextResponse.json({ error: "Error al actualizar asistencia" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const asistencia = await Attendance.findByIdAndDelete(params.id)

    if (!asistencia) {
      return NextResponse.json({ error: "Registro de asistencia no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error al eliminar asistencia:", error)
    return NextResponse.json({ error: "Error al eliminar asistencia" }, { status: 500 })
  }
}
