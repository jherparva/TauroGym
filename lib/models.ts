import mongoose from "mongoose"

// Importar los modelos
import AdminModel from "../models/Admin"
import AttendanceModel from "../models/Attendance"
import PlanModel from "../models/Plan"
import ProductModel from "../models/Product"
import RoutineModel from "../models/Routine"
import SaleModel from "../models/Sale"
import UserModel from "../models/User"
import ActivityModel from "../models/Activity"

// Exportar los modelos
export const Admin = AdminModel
export const Attendance = AttendanceModel
export const Plan = PlanModel
export const Product = ProductModel
export const Routine = RoutineModel
export const Sale = SaleModel
export const User = UserModel
export const Activity = ActivityModel

// Exportar las interfaces
export type { IAdmin } from "../models/Admin"
export type { IAttendance } from "../models/Attendance"
export type { IPlan } from "../models/Plan"
export type { IProduct } from "../models/Product"
export type { IRoutine } from "../models/Routine"
export type { ISale } from "../models/Sale"
export type { IUser } from "../models/User"
export type { IActivity } from "../models/Activity"

// Exportar mongoose
export default mongoose
