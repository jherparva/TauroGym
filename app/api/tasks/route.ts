export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import { getSession } from "../../../lib/auth"
import mongoose from "mongoose"

// Definir esquema para tareas programadas
const TaskSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  frecuencia: { type: String, required: true },
  dia: { type: String },
  hora: { type: String, required: true },
  activa: { type: Boolean, default: true },
  ultimaEjecucion: { type: Date },
  proximaEjecucion: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()

    // Obtener tareas de la base de datos
    const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema)
    const tasks = await Task.find().sort({ createdAt: -1 })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error en GET /api/tasks:", error)
    return NextResponse.json({ error: "Error al obtener tareas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()

    // Validar datos
    if (!body.nombre || !body.tipo || !body.frecuencia || !body.hora) {
      return NextResponse.json({ error: "Todos los campos requeridos son obligatorios" }, { status: 400 })
    }

    if (body.frecuencia === "semanal" && !body.dia) {
      return NextResponse.json({ error: "El día es obligatorio para tareas semanales" }, { status: 400 })
    }

    // Calcular próxima ejecución
    const now = new Date()
    const proximaEjecucion = new Date()
    proximaEjecucion.setHours(Number.parseInt(body.hora.split(":")[0]))
    proximaEjecucion.setMinutes(Number.parseInt(body.hora.split(":")[1]))
    proximaEjecucion.setSeconds(0)
    proximaEjecucion.setMilliseconds(0)

    if (proximaEjecucion <= now) {
      proximaEjecucion.setDate(proximaEjecucion.getDate() + 1)
    }

    if (body.frecuencia === "semanal") {
      const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
      const diaIndex = dias.indexOf(body.dia)
      const hoy = now.getDay()
      let diasHasta = diaIndex - hoy
      if (diasHasta <= 0) diasHasta += 7
      proximaEjecucion.setDate(now.getDate() + diasHasta)
    }

    // Crear nueva tarea
    const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema)
    const newTask = new Task({
      nombre: body.nombre,
      tipo: body.tipo,
      frecuencia: body.frecuencia,
      dia: body.dia,
      hora: body.hora,
      activa: true,
      proximaEjecucion,
    })

    await newTask.save()

    return NextResponse.json({ success: true, task: newTask })
  } catch (error) {
    console.error("Error en POST /api/tasks:", error)
    return NextResponse.json({ error: "Error al crear tarea" }, { status: 500 })
  }
}
