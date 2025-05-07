export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import mongoose from "mongoose"

// Definir esquema para roles
const RoleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  permisos: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Obtener roles de la base de datos
    const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema)

    // Si no hay roles, crear roles predeterminados
    const count = await Role.countDocuments()
    if (count === 0) {
      await Role.create([
        {
          id: "admin",
          nombre: "Administrador",
          permisos: ["usuarios_ver", "usuarios_editar", "config_ver", "config_editar"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "superadmin",
          nombre: "Super Administrador",
          permisos: ["usuarios_ver", "usuarios_editar", "config_ver", "config_editar", "roles_ver", "roles_editar"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "recepcion",
          nombre: "Recepción",
          permisos: ["usuarios_ver", "asistencia_registrar"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
    }

    const roles = await Role.find().sort({ nombre: 1 })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error en GET /api/roles:", error)
    return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 })
  }
}
