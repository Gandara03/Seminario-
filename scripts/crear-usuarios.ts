import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Inicializar firebase-admin solo si no está inicializado
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'eduplus-2cadd.appspot.com',
  });
}
const db = admin.firestore();

const usuarios = [
  { name: 'Admin Uno', email: 'admin1@demo.com', role: 'admin' },
  { name: 'Admin Dos', email: 'admin2@demo.com', role: 'admin' },
  { name: 'Usuario Uno', email: 'user1@demo.com', role: 'user' },
  { name: 'Usuario Dos', email: 'user2@demo.com', role: 'user' },
  { name: 'Usuario Tres', email: 'user3@demo.com', role: 'user' },
  { name: 'Usuario Cuatro', email: 'user4@demo.com', role: 'user' },
  { name: 'Usuario Cinco', email: 'user5@demo.com', role: 'user' },
];

async function crearUsuarios() {
  console.log('Iniciando creación de usuarios...');
  try {
    for (const usuario of usuarios) {
      const userRef = db.collection('users').doc();
      await userRef.set({
        ...usuario,
        createdAt: new Date().toISOString(),
      });
      console.log(`Usuario "${usuario.email}" creado exitosamente`);
    }
    console.log('Todos los usuarios fueron creados.');
  } catch (error) {
    console.error('Error al crear usuarios:', error);
  }
}

crearUsuarios(); 