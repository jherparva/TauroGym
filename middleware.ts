import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Manejar solicitudes OPTIONS para CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers":
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // Verificar si la ruta es una API
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")

  // Si es una ruta de API, permitir el acceso y agregar headers CORS
  if (isApiRoute) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    )
    return response
  }

  // Verificar si la ruta es la de login
  const isLoginPage = request.nextUrl.pathname === "/login"

  // Obtener la sesión
  const session = request.cookies.get("session")?.value

  // Si no hay sesión y no estamos en la página de login, redirigir a login
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay sesión, verificar que sea válida
  if (session) {
    const payload = await decrypt(session)

    // Si la sesión no es válida y no estamos en login, redirigir a login
    if (!payload && !isLoginPage) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Si la sesión es válida y estamos en login, redirigir al dashboard
    if (payload && isLoginPage) {
      const dashboardUrl = new URL("/", request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

// Configurar las rutas que deben ser protegidas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /_next/* (archivos estáticos de Next.js)
     * 2. /favicon.ico, /sitemap.xml, /robots.txt (archivos comunes)
     */
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
