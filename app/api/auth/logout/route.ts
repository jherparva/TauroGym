import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando proceso de logout")

    // Obtener instancia de cookies - Mantener el await para consistencia
    const cookieStore = await cookies()

    // Eliminar la cookie de sesión
    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
    })

    console.log("Logout exitoso")

    // Crear respuesta con headers CORS
    const response = NextResponse.json({ success: true })

    // Agregar headers CORS explícitamente
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    )

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}

// Agregar manejador OPTIONS para CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 })

  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
  response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  )

  return response
}
