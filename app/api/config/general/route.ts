export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import { getSession } from "../../../../lib/auth"
import mongoose from "mongoose"

// Reutilizamos el mismo esquema de configuración
const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
})

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()

    console.log("Datos recibidos en POST /api/config/general:", body)

    // Validar datos
    if (!body.nombreGimnasio) {
      return NextResponse.json({ error: "El nombre del gimnasio es obligatorio" }, { status: 400 })
    }

    // Guardar configuración en la base de datos
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)

    const configData = {
      nombreGimnasio: body.nombreGimnasio,
      direccion: body.direccion || "",
      telefono: body.telefono || "",
      email: body.email || "",
      moneda: body.moneda || "COP",
      formatoFecha: body.formatoFecha || "DD/MM/YYYY",
      zonaHoraria: body.zonaHoraria || "America/Bogota",
      logoUrl: body.logoUrl || "",
      colorPrimario: body.colorPrimario || "",
      colorSecundario: body.colorSecundario || "",
      mostrarLogo: body.mostrarLogo !== undefined ? body.mostrarLogo : true,
      mostrarNombre: body.mostrarNombre !== undefined ? body.mostrarNombre : true,
      mostrarContacto: body.mostrarContacto !== undefined ? body.mostrarContacto : true,
      descripcion: body.descripcion || "",
      horaApertura: body.horaApertura || "",
      horaCierre: body.horaCierre || "",
      diasOperacion: Array.isArray(body.diasOperacion) ? body.diasOperacion : [],
    }

    await Config.findOneAndUpdate(
      { key: "general-config" },
      {
        key: "general-config",
        value: configData,
        updatedAt: new Date(),
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true, config: configData })
  } catch (error) {
    console.error("Error en POST /api/config/general:", error)
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Obtener configuración general de la base de datos
    const Config = mongoose.models.Config || mongoose.model("Config", ConfigSchema)
    const generalConfig = await Config.findOne({ key: "general-config" })

    if (!generalConfig) {
      const defaultConfig = {
        nombreGimnasio: "Tauro Gym",
        direccion: "Av. Principal #123, Ciudad",
        telefono: "+57 300 1234567",
        email: "info@taurogym.com",
        moneda: "COP",
        formatoFecha: "DD/MM/YYYY",
        zonaHoraria: "America/Bogota",
        logoUrl: "/placeholder-logo.svg",
        colorPrimario: "#ff0000",
        colorSecundario: "#000000",
        mostrarLogo: true,
        mostrarNombre: true,
        mostrarContacto: true,
        descripcion: "Gimnasio de alto rendimiento con los mejores equipos y entrenadores.",
        horaApertura: "06:00",
        horaCierre: "22:00",
        diasOperacion: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],
      }

      console.log("Retornando configuración predeterminada")
      return NextResponse.json({ config: defaultConfig })
    }

    console.log("Configuración encontrada:", generalConfig.value)
    return NextResponse.json({ config: generalConfig.value })
  } catch (error) {
    console.error("Error en GET /api/config/general:", error)
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
  }
}
