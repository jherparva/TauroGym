import mongoose, { Schema, type Document } from "mongoose"

interface IProductoVenta {
  producto: mongoose.Types.ObjectId
  cantidad: number
  precio: number
}

export interface ISale extends Document {
  productos: IProductoVenta[]
  total: number
  fecha: Date
  createdAt: Date
  updatedAt: Date
}

const ProductoVentaSchema: Schema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
})

const SaleSchema: Schema = new Schema(
  {
    productos: [ProductoVentaSchema],
    total: { type: Number, required: true },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema)
