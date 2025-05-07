//C:\Users\jhon\Downloads\tauroGYM1\lib\mongodb.ts
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor, define la variable de entorno MONGODB_URI")
}

const MONGODB_URI = process.env.MONGODB_URI

/**
 * Variables globales para mantener el estado de la conexión
 * a través de recargas de desarrollo
 */
declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Conexión a MongoDB establecida")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("Error al conectar a MongoDB:", e)
    throw e
  }

  return cached.conn
}

export default dbConnect