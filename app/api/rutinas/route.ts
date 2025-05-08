import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Routine from "../../../models/Routine"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const estado = searchParams.get("estado")

    let filter = {}
    if (estado) {
      filter = { estado }
    }

    const rutinas = await Routine.find(filter).sort({ createdAt: -1 })

    return NextResponse.json({ rutinas }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener rutinas:", error)
    return NextResponse.json({ error: "Error al obtener rutinas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const rutina = new Routine(body)
    await rutina.save()

    return NextResponse.json({ rutina }, { status: 201 })
  } catch (error) {
    console.error("Error al crear rutina:", error)
    return NextResponse.json({ error: "Error al crear rutina" }, { status: 500 })
  }
}
