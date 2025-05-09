import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Esperar la instancia asincrónica de cookies
    const cookieStore = await cookies()

    // Eliminar la cookie de sesión
    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
