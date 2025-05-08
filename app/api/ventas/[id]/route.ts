//C:\Users\jhon\Downloads\tauroGYM1\app\api\ventas\[id]\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import Sale from "../../../../models/Sale"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const venta = await Sale.findById(params.id).populate("productos.producto")

    if (!venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ venta }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener venta:", error)
    return NextResponse.json({ error: "Error al obtener venta" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const venta = await Sale.findByIdAndDelete(params.id)

    if (!venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Venta eliminada correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error al eliminar venta:", error)
    return NextResponse.json({ error: "Error al eliminar venta" }, { status: 500 })
  }
}
