"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
// Inicializar firebase-admin solo si no está inicializado
if (!(0, app_1.getApps)().length) {
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
    }
    catch (error) {
        console.error('Error al crear usuarios:', error);
    }
}
crearUsuarios();
