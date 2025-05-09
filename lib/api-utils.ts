import { type NextRequest, NextResponse } from "next/server"
import { corsMiddleware } from "./cors"
import { isAuthenticated } from "./auth"
import dbConnect from "./mongodb"

/**
 * Manejador genérico para rutas API
 * @param req Solicitud Next.js
 * @param handler Función que maneja la lógica de la ruta
 * @param params Parámetros de la ruta (opcional)
 * @param options Opciones adicionales (opcional)
 * @returns Respuesta Next.js
 */
export async function apiHandler(
  req: NextRequest,
  handler: (req: NextRequest, params?: any) => Promise<any>,
  params?: any,
  options: {
    requireAuth?: boolean
    errorMessage?: string
  } = { requireAuth: true },
) {
  try {
    // Aplicar middleware CORS
    const corsResponse = corsMiddleware(req)
    if (corsResponse) return corsResponse

    // Verificar autenticación si es requerida
    if (options.requireAuth) {
      const authenticated = await isAuthenticated()
      if (!authenticated) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
      }
    }

    // Conectar a la base de datos
    await dbConnect()

    // Ejecutar el manejador específico
    const result = await handler(req, params)

    // Devolver respuesta
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error(`Error en API: ${error.message}`, error)

    // Determinar el código de estado basado en el mensaje de error
    let status = 500
    if (error.message.includes("no encontrado") || error.message.includes("not found")) {
      status = 404
    } else if (
      error.message.includes("no autorizado") ||
      error.message.includes("unauthorized") ||
      error.message.includes("no autenticado")
    ) {
      status = 401
    } else if (
      error.message.includes("ya existe") ||
      error.message.includes("duplicado") ||
      error.message.includes("duplicate")
    ) {
      status = 409
    } else if (error.message.includes("validación") || error.message.includes("requerido")) {
      status = 400
    }

    return NextResponse.json({ error: options.errorMessage || error.message || "Error en el servidor" }, { status })
  }
}

/**
 * Función para registrar actividad del usuario
 * @param userId ID del usuario o tipo de usuario (admin, system, etc.)
 * @param tipo Tipo de actividad
 * @param descripcion Descripción de la actividad
 * @param metadata Datos adicionales (opcional)
 */
export async function logActivity(
  userId: string,
  tipo: string,
  descripcion: string,
  metadata: any = {},
): Promise<void> {
  try {
    await dbConnect()

    // Importar el modelo Activity de forma dinámica para evitar problemas de importación circular
    const { Activity } = await import("./models")

    // Crear un nuevo registro de actividad
    await Activity.create({
      userId,
      tipo,
      descripcion,
      metadata,
    })

    console.log(`Actividad registrada: Usuario ${userId}, Tipo: ${tipo}`)
  } catch (error) {
    console.error("Error al registrar actividad:", error)
  }
}
