//C:\Users\jhon\Music\TauroGym\app\api\usuarios\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Obtener parámetros de consulta
    const url = new URL(req.url)
    const query = url.searchParams.get("query") || ""
    const estado = url.searchParams.get("estado") || ""

    // Construir filtro de búsqueda
    let filter: any = {}
    if (query) {
      filter = {
        $or: [
          { nombre: { $regex: query, $options: "i" } },
          { cedula: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      }
    }

    // Añadir filtro por estado si se proporciona
    if (estado) {
      filter.estado = estado
    }

    // Obtener usuarios con sus planes
    const users = await User.find(filter).populate("plan").sort({ createdAt: -1 })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error en GET /api/usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // Validar datos requeridos
    if (!body.cedula || !body.nombre || !body.telefono) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: cédula, nombre y teléfono son obligatorios" },
        { status: 400 },
      )
    }

    // Verificar si ya existe un usuario con la misma cédula
    const existingUser = await User.findOne({ cedula: body.cedula })
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe un usuario con esta cédula" }, { status: 400 })
    }

    // Crear el usuario con montoPagado inicializado en 0
    const userData = {
      cedula: body.cedula,
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono,
      direccion: body.direccion,
      estado: body.estado || "activo",
      fechaNacimiento: body.fechaNacimiento,
      plan: body.plan || null,
      fechaInicio: body.fechaInicio || null,
      fechaFin: body.fechaFin || null,
      montoPagado: 0, // Inicializar montoPagado en 0
    }

    const user = await User.create(userData)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/usuarios:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
