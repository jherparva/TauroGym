import mongoose, { Schema, type Document } from "mongoose"

export interface IAttendance extends Document {
  usuario: mongoose.Types.ObjectId
  fecha: Date
  horaEntrada: Date
  horaSalida?: Date
  observaciones?: string
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema: Schema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fecha: { type: Date, required: true },
    horaEntrada: { type: Date, required: true },
    horaSalida: { type: Date, required: false },
    observaciones: { type: String, required: false },
  },
  { timestamps: true },
)

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema)
