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
const cursos_1 = require("../lib/cursos");
const path = __importStar(require("path"));
const admin = __importStar(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
const serviceAccount = __importStar(require("../serviceAccountKey.json"));
const fs = __importStar(require("fs"));
// Inicializar firebase-admin solo si no está inicializado
if (!(0, app_1.getApps)().length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'eduplus-2cadd.appspot.com',
    });
}
const cursosEjemplo = [
    {
        titulo: "Desarrollo Web Full Stack",
        descripcion: "Aprende a crear aplicaciones web completas con las últimas tecnologías.",
        duracion: "6 meses",
        nivel: "Intermedio",
        precio: 299.99,
        imagen: "/cursos/web-fullstack.jpg",
        instructor: "Juan Pérez",
        categoria: "Desarrollo Web"
    },
    {
        titulo: "Machine Learning con Python",
        descripcion: "Introducción a la inteligencia artificial y machine learning.",
        duracion: "4 meses",
        nivel: "Avanzado",
        precio: 399.99,
        imagen: "/cursos/ml-python.jpg",
        instructor: "María García",
        categoria: "Inteligencia Artificial"
    },
    {
        titulo: "Diseño UX/UI",
        descripcion: "Aprende a crear interfaces de usuario atractivas y funcionales.",
        duracion: "3 meses",
        nivel: "Principiante",
        precio: 199.99,
        imagen: "/cursos/ux-ui.jpg",
        instructor: "Carlos Rodríguez",
        categoria: "Diseño"
    },
    {
        titulo: "Marketing Digital",
        descripcion: "Estrategias efectivas de marketing en el mundo digital.",
        duracion: "3 meses",
        nivel: "Intermedio",
        precio: 249.99,
        imagen: "/cursos/marketing.jpg",
        instructor: "Ana Martínez",
        categoria: "Marketing"
    },
    {
        titulo: "Desarrollo Móvil con React Native",
        descripcion: "Crea aplicaciones móviles multiplataforma con React Native.",
        duracion: "5 meses",
        nivel: "Intermedio",
        precio: 349.99,
        imagen: "/cursos/react-native.jpg",
        instructor: "Luis Sánchez",
        categoria: "Desarrollo Móvil"
    },
    {
        titulo: "DevOps y CI/CD",
        descripcion: "Aprende las mejores prácticas de DevOps y automatización.",
        duracion: "4 meses",
        nivel: "Avanzado",
        precio: 379.99,
        imagen: "/cursos/devops.jpg",
        instructor: "Pedro Gómez",
        categoria: "DevOps"
    }
];
async function cargarCursosDesdeJSON() {
    try {
        const cursosDir = path.join(process.cwd(), 'public', 'cursos-data');
        if (!fs.existsSync(cursosDir)) {
            console.log('No se encontró el directorio de cursos JSON, usando cursos de ejemplo');
            return [];
        }
        const archivos = fs.readdirSync(cursosDir).filter(f => f.endsWith('.json'));
        const cursos = [];
        for (const archivo of archivos) {
            const filePath = path.join(cursosDir, archivo);
            const data = fs.readFileSync(filePath, 'utf-8');
            const curso = JSON.parse(data);
            cursos.push({
                titulo: curso.nombre || curso.titulo,
                descripcion: curso.descripcion,
                duracion: curso.duracion,
                nivel: curso.nivel,
                precio: curso.precio || 0,
                imagen: curso.imagen,
                instructor: curso.instructor || 'Desconocido',
                categoria: curso.categoria,
                objetivos: curso.objetivos || [],
                requisitos: curso.requisitos || [],
                temario: curso.temario || [],
                materiales: curso.materiales || [],
                modulos: curso.modulos || [],
                comentarios: curso.comentarios || [],
            });
        }
        return cursos;
    }
    catch (error) {
        console.error('Error al cargar cursos desde JSON:', error);
        return [];
    }
}
async function migrarCursos() {
    console.log('Iniciando migración de cursos...');
    try {
        // Cargar cursos desde JSON
        const cursosJSON = await cargarCursosDesdeJSON();
        const todosLosCursos = [...cursosEjemplo, ...cursosJSON];
        for (const curso of todosLosCursos) {
            await cursos_1.cursosService.createCurso(curso);
            console.log(`Curso "${curso.titulo}" migrado exitosamente`);
        }
        console.log('Migración de cursos completada exitosamente');
    }
    catch (error) {
        console.error('Error durante la migración de cursos:', error);
    }
}
// Ejecutar la migración
migrarCursos();
