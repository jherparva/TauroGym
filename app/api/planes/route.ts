//C:\Users\jhon\Downloads\tauroGYM1\app\api\planes\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../..//lib/mongodb"
import { Plan } from "../../..//lib/models"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const estado = searchParams.get("estado")

    let filter = {}
    if (estado) {
      filter = { estado }
    }

    const planes = await Plan.find(filter).sort({ precio: 1 })

    return NextResponse.json({ planes }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener planes:", error)
    return NextResponse.json({ error: "Error al obtener planes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const plan = new Plan(body)
    await plan.save()

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Error al crear plan:", error)
    return NextResponse.json({ error: "Error al crear plan" }, { status: 500 })
  }
}