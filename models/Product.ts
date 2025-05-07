import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  estado: "activo" | "inactivo"
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    categoria: { type: String, required: true },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
  },
  { timestamps: true },
)

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)