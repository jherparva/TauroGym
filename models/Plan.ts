import mongoose from "mongoose"

const PlanSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
    },
    precio: {
      type: Number,
      required: true,
    },
    duracion: {
      type: Number,
      required: true,
      default: 30, // Duración predeterminada en días
    },
    tipoDuracion: {
      type: String,
      enum: ["dia", "semana", "mes"],
      default: "mes",
      required: true,
    },
    beneficios: {
      type: [String],
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
  },
  { timestamps: true },
)

export interface IPlan {
  _id: string
  nombre: string
  descripcion: string
  precio: number
  duracion: number
  tipoDuracion: "dia" | "semana" | "mes"
  beneficios: string[]
  estado: "activo" | "inactivo"
  createdAt: Date
  updatedAt: Date
}

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema)
