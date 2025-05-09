import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Permitir explícitamente los métodos OPTIONS, PUT y DELETE
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // Configurar CORS para todas las respuestas
  const response = NextResponse.next()
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Verificar autenticación solo para rutas no API
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const session = request.cookies.get("session")?.value
    const isLoginPage = request.nextUrl.pathname === "/login"

    if (!session && !isLoginPage) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (session) {
      const payload = await decrypt(session)

      if (!payload && !isLoginPage) {
        const loginUrl = new URL("/login", request.url)
        return NextResponse.redirect(loginUrl)
      }

      if (payload && isLoginPage) {
        const dashboardUrl = new URL("/", request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }

  return response
}

// Configurar las rutas que deben ser protegidas, excluyendo las API
export const config = {
  matcher: ["/((?!_next|favicon.ico|sitemap.xml|robots.txt).*)"],
}
