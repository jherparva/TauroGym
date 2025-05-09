import { type NextRequest, NextResponse } from "next/server"

export function corsMiddleware(req: NextRequest) {
  // Configurar headers CORS para la respuesta
  const response = req.method === "OPTIONS" ? new NextResponse(null, { status: 204 }) : NextResponse.next()

  // Agregar headers CORS
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Origin", "*") // En producción, reemplaza con tu dominio específico
  response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  // Si es una solicitud OPTIONS, devolver la respuesta inmediatamente
  if (req.method === "OPTIONS") {
    return response
  }

  // Para otros métodos, continuar con la ejecución
  return null
}
