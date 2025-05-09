import { type NextRequest, NextResponse } from "next/server"

export function corsMiddleware(req: NextRequest) {
  // Si es una solicitud OPTIONS, devolver respuesta inmediata con headers CORS
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 })

    // Configurar headers CORS
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", "*") // En producción, reemplazar con dominio específico
    response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    )

    return response
  }

  // Para otros métodos, continuar con la ejecución
  return null
}
