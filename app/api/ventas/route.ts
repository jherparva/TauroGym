//C:\Users\jhon\Downloads\tauroGYM1\app\api\ventas\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Sale from "@/models/Sale"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    const filter: any = {}

    if (desde || hasta) {
      filter.fecha = {}
      if (desde) {
        filter.fecha.$gte = new Date(desde)
      }
      if (hasta) {
        filter.fecha.$lte = new Date(hasta)
      }
    }

    const ventas = await Sale.find(filter).populate("productos.producto").sort({ fecha: -1 })

    return NextResponse.json({ ventas }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener ventas:", error)
    return NextResponse.json({ error: "Error al obtener ventas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // Actualizar el stock de los productos
    for (const item of body.productos) {
      const producto = await Product.findById(item.producto)
      if (!producto) {
        return NextResponse.json({ error: `Producto con ID ${item.producto} no encontrado` }, { status: 404 })
      }

      if (producto.stock < item.cantidad) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          },
          { status: 400 },
        )
      }

      producto.stock -= item.cantidad
      await producto.save()
    }

    const venta = new Sale(body)
    await venta.save()

    return NextResponse.json({ venta }, { status: 201 })
  } catch (error) {
    console.error("Error al crear venta:", error)
    return NextResponse.json({ error: "Error al crear venta" }, { status: 500 })
  }
}
