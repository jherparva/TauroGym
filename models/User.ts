//C:\Users\jhon\Downloads\tauroGYM1\models\User.ts

// Modelo de Usuario actualizado con campo montoPagado
import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  cedula: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  fechaNacimiento: Date
  estado: "activo" | "inactivo"
  plan: mongoose.Types.ObjectId
  fechaInicio: Date
  fechaFin: Date
  montoPagado: number // Campo añadido para registrar el monto pagado
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: false },
    telefono: { type: String, required: true },
    direccion: { type: String, required: false },
    fechaNacimiento: { type: Date, required: false },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: false },
    fechaInicio: { type: Date, required: false },
    fechaFin: { type: Date, required: false },
    montoPagado: { type: Number, default: 0 }, // Campo añadido con valor predeterminado 0
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)