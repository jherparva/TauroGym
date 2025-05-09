import { NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    await dbConnect()

    // Verificar la conexión
    const connectionState = mongoose.connection.readyState
    let connectionStatus = "Desconocido"

    switch (connectionState) {
      case 0:
        connectionStatus = "Desconectado"
        break
      case 1:
        connectionStatus = "Conectado"
        break
      case 2:
        connectionStatus = "Conectando"
        break
      case 3:
        connectionStatus = "Desconectando"
        break
    }

    // Verificar permisos intentando una operación de escritura en una colección temporal
    let writePermission = false
    try {
      const diagnosticCollection = mongoose.connection.collection("_diagnostic_test")
      const testDoc = { test: true, timestamp: new Date() }
      await diagnosticCollection.insertOne(testDoc)
      await diagnosticCollection.deleteOne({ test: true })
      writePermission = true
    } catch (error) {
      console.error("Error al verificar permisos de escritura:", error)
    }

    // Verificar la configuración de CORS
    const corsConfig = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }

    return NextResponse.json({
      status: "ok",
      database: {
        connection: connectionStatus,
        writePermission,
        uri: process.env.MONGODB_URI ? "Configurado" : "No configurado",
      },
      environment: process.env.NODE_ENV,
      cors: corsConfig,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en diagnóstico:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Agregar soporte para OPTIONS para pruebas de CORS
export async function OPTIONS() {
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
