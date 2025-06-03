import { cursosService } from '../lib/cursos';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import * as serviceAccount from '../serviceAccountKey.json';
import * as fs from 'fs';

// Inicializar firebase-admin solo si no está inicializado
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
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
    const cursos: any[] = [];
    
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
  } catch (error) {
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
      await cursosService.createCurso(curso);
      console.log(`Curso "${curso.titulo}" migrado exitosamente`);
    }
    console.log('Migración de cursos completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración de cursos:', error);
  }
}

// Ejecutar la migración
migrarCursos(); 