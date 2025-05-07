//C:\Users\jhon\Downloads\tauroGYM1\app\api\asistencia\route.ts

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const fecha = searchParams.get("fecha")
    const usuarioId = searchParams.get("usuario")
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    const filter: any = {}

    if (fecha) {
      const fechaInicio = new Date(fecha)
      fechaInicio.setHours(0, 0, 0, 0)

      const fechaFin = new Date(fecha)
      fechaFin.setHours(23, 59, 59, 999)

      filter.fecha = {
        $gte: fechaInicio,
        $lte: fechaFin,
      }
    } else if (desde && hasta) {
      // Filtro por rango de fechas
      const fechaDesde = new Date(desde)
      fechaDesde.setHours(0, 0, 0, 0)

      const fechaHasta = new Date(hasta)
      fechaHasta.setHours(23, 59, 59, 999)

      filter.fecha = {
        $gte: fechaDesde,
        $lte: fechaHasta,
      }
    }

    if (usuarioId) {
      filter.usuario = usuarioId
    }

    const asistencias = await Attendance.find(filter).populate("usuario").sort({ fecha: -1, horaEntrada: -1 })

    return NextResponse.json({ asistencias }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener asistencias:", error)
    return NextResponse.json({ error: "Error al obtener asistencias" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    // Verificar si ya existe una asistencia para este usuario en la misma fecha
    const fechaActual = new Date(body.fecha || Date.now())
    fechaActual.setHours(0, 0, 0, 0)

    const fechaFin = new Date(fechaActual)
    fechaFin.setHours(23, 59, 59, 999)

    const asistenciaExistente = await Attendance.findOne({
      usuario: body.usuario,
      fecha: {
        $gte: fechaActual,
        $lte: fechaFin,
      },
    })

    if (asistenciaExistente && !body.horaSalida) {
      return NextResponse.json(
        {
          error: "Ya existe un registro de asistencia para este usuario en la fecha indicada",
        },
        { status: 400 },
      )
    }

    // Si es un registro de salida, actualizar la asistencia existente
    if (body.horaSalida && asistenciaExistente) {
      asistenciaExistente.horaSalida = body.horaSalida
      if (body.observaciones) {
        asistenciaExistente.observaciones = body.observaciones
      }
      await asistenciaExistente.save()
      return NextResponse.json({ asistencia: asistenciaExistente }, { status: 200 })
    }

    // Si es un nuevo registro de entrada
    const asistencia = new Attendance(body)
    await asistencia.save()

    return NextResponse.json({ asistencia }, { status: 201 })
  } catch (error) {
    console.error("Error al registrar asistencia:", error)
    return NextResponse.json({ error: "Error al registrar asistencia" }, { status: 500 })
  }
}
