import mongoose, { Schema, type Document } from "mongoose"

interface IEjercicio {
  nombre: string
  series: number
  repeticiones: number
  descanso: number // en segundos
}

export interface IRoutine extends Document {
  nombre: string
  descripcion: string
  ejercicios: IEjercicio[]
  estado: "activo" | "inactivo"
  createdAt: Date
  updatedAt: Date
}

const EjercicioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  series: { type: Number, required: true },
  repeticiones: { type: Number, required: true },
  descanso: { type: Number, required: true }, // en segundos
})

const RoutineSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    ejercicios: [EjercicioSchema],
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
  },
  { timestamps: true },
)

export default mongoose.models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema)
