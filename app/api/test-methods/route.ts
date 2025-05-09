import { NextResponse } from "next/server"

// Función para manejar solicitudes GET
export async function GET() {
  return NextResponse.json({ method: "GET", success: true, timestamp: new Date().toISOString() })
}

// Función para manejar solicitudes POST
export async function POST() {
  return NextResponse.json({ method: "POST", success: true, timestamp: new Date().toISOString() })
}

// Función para manejar solicitudes PUT
export async function PUT() {
  return NextResponse.json({ method: "PUT", success: true, timestamp: new Date().toISOString() })
}

// Función para manejar solicitudes DELETE
export async function DELETE() {
  return NextResponse.json({ method: "DELETE", success: true, timestamp: new Date().toISOString() })
}

// Función para manejar solicitudes OPTIONS (para CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
