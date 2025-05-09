import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Verificar si es una solicitud OPTIONS (preflight CORS)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  const session = request.cookies.get("session")?.value

  // Verificar si la ruta es la de login o una ruta de API
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")

  // Si es una ruta de API, permitir el acceso y agregar headers CORS
  if (isApiRoute) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

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
     * 1. /api/auth/* (rutas de autenticación de API)
     * 2. /_next/* (archivos estáticos de Next.js)
     * 3. /favicon.ico, /sitemap.xml, /robots.txt (archivos comunes)
     */
    "/((?!api/auth|_next|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
