import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth"

export async function middleware(request: NextRequest) {
  try {
    console.log("Middleware ejecutándose para ruta:", request.nextUrl.pathname)

    const session = request.cookies.get("session")?.value

    // Verificar si la ruta es la de login
    const isLoginPage = request.nextUrl.pathname === "/login"

    // Si no hay sesión y no estamos en la página de login, redirigir a login
    if (!session && !isLoginPage) {
      console.log("No hay sesión, redirigiendo a login")
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Si hay sesión, verificar que sea válida
    if (session) {
      try {
        const payload = await decrypt(session)

        // Si la sesión no es válida y no estamos en login, redirigir a login
        if (!payload && !isLoginPage) {
          console.log("Sesión inválida, redirigiendo a login")
          const loginUrl = new URL("/login", request.url)
          return NextResponse.redirect(loginUrl)
        }

        // Verificar si la sesión ha expirado
        if (payload && payload.expires && new Date(payload.expires) < new Date() && !isLoginPage) {
          console.log("Sesión expirada, redirigiendo a login")
          const loginUrl = new URL("/login", request.url)
          return NextResponse.redirect(loginUrl)
        }

        // Si la sesión es válida y estamos en login, redirigir al dashboard
        if (payload && isLoginPage) {
          console.log("Sesión válida en página de login, redirigiendo a dashboard")
          const dashboardUrl = new URL("/", request.url)
          return NextResponse.redirect(dashboardUrl)
        }

        // Si todo está bien, agregar el usuario a los headers para uso en la aplicación
        if (payload && !isLoginPage) {
          const requestHeaders = new Headers(request.headers)
          requestHeaders.set("x-user-id", payload.id)
          requestHeaders.set("x-user-role", payload.rol || "")

          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error)
        // Si hay un error al verificar la sesión y no estamos en login, redirigir a login
        if (!isLoginPage) {
          const loginUrl = new URL("/login", request.url)
          return NextResponse.redirect(loginUrl)
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Error en middleware:", error)
    return NextResponse.next()
  }
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
