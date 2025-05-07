// scripts/updateSchemas.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// URL de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tauroGYM';

// Función para conectar a MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB correctamente');
    return true;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    return false;
  }
}

// Función para actualizar el esquema de Usuario
async function updateUserSchema() {
  try {
    // Definir el esquema actual de Usuario
    const UserSchema = new mongoose.Schema({
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
      montoPagado: { type: Number, default: 0 }, // Campo añadido
    }, { timestamps: true });

    // Registrar el modelo
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Actualizar todos los documentos que no tienen el campo montoPagado
    const result = await User.updateMany(
      { montoPagado: { $exists: false } },
      { $set: { montoPagado: 0 } }
    );

    console.log(`Esquema de Usuario actualizado: ${result.modifiedCount} documentos modificados`);
    return true;
  } catch (error) {
    console.error('Error al actualizar el esquema de Usuario:', error);
    return false;
  }
}

// Función principal
async function main() {
  // Conectar a la base de datos
  const isConnected = await connectToDatabase();
  if (!isConnected) {
    process.exit(1);
  }

  // Actualizar los esquemas
  await updateUserSchema();
  
  // Cerrar la conexión
  await mongoose.disconnect();
  console.log('Actualización de esquemas completada con éxito');
}

// Ejecutar la función principal
main().catch(err => {
  console.error('Error en el script principal:', err);
  process.exit(1);
});