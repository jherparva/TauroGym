// Script para crear un administrador por defecto
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';

// Cargar variables de entorno
dotenv.config();

// Verificar que existe la variable de entorno MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error('Error: La variable de entorno MONGODB_URI no está definida');
  console.error('Por favor, crea un archivo .env con la variable MONGODB_URI');
  process.exit(1);
}

// Función principal
async function initAdmin() {
  try {
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexión a MongoDB establecida');

    // Verificar si ya existe un administrador
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // Crear un hash para la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Crear administrador
      await Admin.create({
        cedula: 'V-12345678',
        nombre: 'Administrador',
        password: hashedPassword,
        rol: 'superadmin',
        estado: 'activo'
      });
      
      console.log('✅ Administrador por defecto creado:');
      console.log('   Cédula: V-12345678');
      console.log('   Contraseña: admin123');
    } else {
      console.log('✅ Ya existe un administrador en la base de datos');
    }
    
    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
initAdmin();