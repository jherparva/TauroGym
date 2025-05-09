import type { NextRequest } from "next/server"
import { User } from "../../../lib/models"
import { apiHandler, logActivity } from "../../../lib/api-utils"

// GET - Obtener todos los usuarios
export async function GET(req: NextRequest) {
  return apiHandler(req, async (req) => {
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

    return { users }
  })
}

// POST - Crear un nuevo usuario
export async function POST(req: NextRequest) {
  return apiHandler(
    req,
    async (req) => {
      const body = await req.json()

      // Validar datos requeridos
      if (!body.cedula || !body.nombre || !body.telefono) {
        throw new Error("Faltan campos requeridos: cédula, nombre y teléfono son obligatorios")
      }

      // Verificar si ya existe un usuario con la misma cédula
      const existingUser = await User.findOne({ cedula: body.cedula })
      if (existingUser) {
        throw new Error("Ya existe un usuario con esta cédula")
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

      // Registrar actividad
      logActivity("admin", "crear_usuario", `Usuario creado: ${user.nombre}`)

      return { user }
    },
    undefined,
    { errorMessage: "Error al crear usuario" },
  )
}
