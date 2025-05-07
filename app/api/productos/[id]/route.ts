//C:\Users\jhon\Downloads\tauroGYM1\app\api\productos\[id]\route.ts
import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const producto = await Product.findById(params.id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto, { status: 200 })
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const body = await req.json()
    console.log(`Actualizando producto ${params.id} con datos:`, body)
    
    const producto = await Product.findByIdAndUpdate(params.id, body, { new: true })

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("Producto actualizado con éxito:", producto)
    return NextResponse.json(producto, { status: 200 })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    console.log(`Eliminando producto con ID: ${params.id}`)
    const producto = await Product.findByIdAndDelete(params.id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("Producto eliminado con éxito")
    return NextResponse.json({ mensaje: "Producto eliminado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}