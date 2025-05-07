import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value

  // Verificar si la ruta es la de login
  const isLoginPage = request.nextUrl.pathname === "/login"

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