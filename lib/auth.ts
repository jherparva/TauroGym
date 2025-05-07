import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const secretKey = process.env.JWT_SECRET || "default_secret_key_change_in_production"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  if (payload.id && typeof payload.id === "object" && payload.id.toString) {
    payload = {
      ...payload,
      id: payload.id.toString(),
    }
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Error al verificar token:", error)
    return null
  }
}

export async function login(formData: FormData) {
  const cedula = formData.get("cedula") as string
  const password = formData.get("password") as string

  // Aquí iría la lógica para verificar las credenciales en la base de datos
  const user = { cedula, role: "admin" }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session = await encrypt({ user, expires })

  const cookieStore = await cookies()
  cookieStore.set("session", session, { expires, httpOnly: true })

  return user
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null

  const parsed = await decrypt(session)
  if (!parsed) return null

  return parsed
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) return

  const parsed = await decrypt(session)
  if (!parsed) return

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const newSession = await encrypt({ user: parsed.user, expires })

  const response = NextResponse.next()
  response.cookies.set({
    name: "session",
    value: newSession,
    expires,
    httpOnly: true,
  })

  return response
}
