export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import { getSession } from "../../../lib/auth"
import mongoose from "mongoose"

// Definir esquema para permisos
const PermissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
})

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Obtener permisos de la base de datos
    const Permission = mongoose.models.Permission || mongoose.model("Permission", PermissionSchema)

    // Si no hay permisos, crear permisos predeterminados
    const count = await Permission.countDocuments()
    if (count === 0) {
      await Permission.create([
        { id: "usuarios_ver", nombre: "Ver usuarios", descripcion: "Permite ver la lista de usuarios" },
        { id: "usuarios_editar", nombre: "Editar usuarios", descripcion: "Permite crear y editar usuarios" },
        { id: "config_ver", nombre: "Ver configuración", descripcion: "Permite ver la configuración del sistema" },
        {
          id: "config_editar",
          nombre: "Editar configuración",
          descripcion: "Permite editar la configuración del sistema",
        },
        { id: "roles_ver", nombre: "Ver roles", descripcion: "Permite ver los roles del sistema" },
        { id: "roles_editar", nombre: "Editar roles", descripcion: "Permite editar los roles y permisos" },
        {
          id: "asistencia_registrar",
          nombre: "Registrar asistencia",
          descripcion: "Permite registrar la asistencia de usuarios",
        },
        { id: "reportes_ver", nombre: "Ver reportes", descripcion: "Permite ver los reportes del sistema" },
      ])
    }

    const permissions = await Permission.find().sort({ nombre: 1 })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error en GET /api/permissions:", error)
    return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 })
  }
}
