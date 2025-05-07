import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IAdmin extends Document {
  cedula: string
  nombre: string
  password: string
  rol: "admin" | "superadmin"
  estado: "activo" | "inactivo"
  comparePassword: (candidatePassword: string) => Promise<boolean>
  createdAt: Date
  updatedAt: Date
}

const AdminSchema: Schema = new Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
  },
  { timestamps: true },
)

// Middleware para hashear la contraseña antes de guardar
AdminSchema.pre("save", async function (next) {
  const admin = this as IAdmin

  // Solo hashear la contraseña si ha sido modificada o es nueva
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    admin.password = await bcrypt.hash(admin.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Método para comparar contraseñas
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)
