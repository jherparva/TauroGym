import mongoose from "mongoose"

// Importar los modelos
import AdminModel, { type IAdmin } from "../models/Admin"
import AttendanceModel, { type IAttendance } from "../models/Attendance"
import PlanModel, { type IPlan } from "../models/Plan"
import ProductModel, { type IProduct } from "../models/Product"
import RoutineModel, { type IRoutine } from "../models/Routine"
import SaleModel, { type ISale } from "../models/Sale"
import UserModel from "../models/User"

// Actualizar el esquema de Usuario para incluir el campo montoPagado
const UserSchema = new mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: false },
    telefono: { type: String, required: true },
    direccion: { type: String, required: false },
    fechaNacimiento: { type: Date, required: false },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: false },
    fechaInicio: { type: Date, required: false },
    fechaFin: { type: Date, required: false },
    montoPagado: { type: Number, default: 0 }, // Añadido campo montoPagado con valor predeterminado 0
  },
  { timestamps: true },
)

// También actualizar la interfaz IUser para incluir montoPagado
export interface IUser {
  _id: string
  cedula: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  fechaNacimiento: Date
  estado: "activo" | "inactivo"
  plan: mongoose.Types.ObjectId | IUser
  fechaInicio: Date
  fechaFin: Date
  montoPagado: number // Añadido campo montoPagado
  createdAt: Date
  updatedAt: Date
}

// Exportar los modelos
export const Admin = AdminModel
export const Attendance = AttendanceModel
export const Plan = PlanModel
export const Product = ProductModel
export const Routine = RoutineModel
export const Sale = SaleModel
export const User = UserModel

// Exportar las interfaces
export type { IAdmin, IAttendance, IPlan, IProduct, IRoutine, ISale, IUser }

// Exportar mongoose
export default mongoose