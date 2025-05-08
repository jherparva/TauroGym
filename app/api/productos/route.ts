//C:\Users\jhon\Downloads\tauroGYM1\app\api\productos\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Product from "../../../models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("query") || ""
    const categoria = searchParams.get("categoria")

    // Configurar filtros para MongoDB
    const filter: any = {}
    
    // Filtro de búsqueda por texto en nombre o descripción
    if (query) {
      filter.$or = [
        { nombre: { $regex: query, $options: "i" } }, 
        { descripcion: { $regex: query, $options: "i" } }
      ]
    }

    // Filtro por categoría
    if (categoria) {
      filter.categoria = categoria
    }

    // Registro para depuración
    console.log("Filtro de búsqueda:", JSON.stringify(filter))

    // Ejecutar consulta a la base de datos
    const productos = await Product.find(filter).sort({ nombre: 1 })
    console.log(`Se encontraron ${productos.length} productos`)

    // Devolver directamente el array de productos
    return NextResponse.json(productos, { status: 200 })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    console.log("Datos recibidos para crear producto:", body)
    
    const producto = new Product(body)
    await producto.save()
    console.log("Producto creado con éxito:", producto)

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}