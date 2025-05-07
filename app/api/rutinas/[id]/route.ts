import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Routine from "@/models/Routine"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const rutina = await Routine.findById(params.id)

    if (!rutina) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ rutina }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener rutina:", error)
    return NextResponse.json({ error: "Error al obtener rutina" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    const rutina = await Routine.findByIdAndUpdate(params.id, body, { new: true })

    if (!rutina) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ rutina }, { status: 200 })
  } catch (error) {
    console.error("Error al actualizar rutina:", error)
    return NextResponse.json({ error: "Error al actualizar rutina" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const rutina = await Routine.findByIdAndDelete(params.id)

    if (!rutina) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Rutina eliminada correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error al eliminar rutina:", error)
    return NextResponse.json({ error: "Error al eliminar rutina" }, { status: 500 })
  }
}
