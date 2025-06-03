"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var cursos_1 = require("../lib/cursos");
var fs_1 = require("fs");
var path = require("path");
var admin = require("firebase-admin");
var app_1 = require("firebase-admin/app");
var serviceAccount = require("../serviceAccountKey.json");
// Inicializar firebase-admin solo si no está inicializado
if (!(0, app_1.getApps)().length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'eduplus-2cadd.appspot.com',
    });
}
var db = admin.firestore();
var cursosEjemplo = [
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
var usuarios = [
    { name: 'Admin Uno', email: 'admin1@demo.com', role: 'admin' },
    { name: 'Admin Dos', email: 'admin2@demo.com', role: 'admin' },
    { name: 'Usuario Uno', email: 'user1@demo.com', role: 'user' },
    { name: 'Usuario Dos', email: 'user2@demo.com', role: 'user' },
    { name: 'Usuario Tres', email: 'user3@demo.com', role: 'user' },
    { name: 'Usuario Cuatro', email: 'user4@demo.com', role: 'user' },
    { name: 'Usuario Cinco', email: 'user5@demo.com', role: 'user' },
    { name: 'Usuario Seis', email: 'user6@demo.com', role: 'user' },
    { name: 'Usuario Siete', email: 'user7@demo.com', role: 'user' },
    { name: 'Usuario Ocho', email: 'user8@demo.com', role: 'user' },
    { name: 'Usuario Nueve', email: 'user9@demo.com', role: 'user' },
    { name: 'Usuario Diez', email: 'user10@demo.com', role: 'user' },
    { name: 'Usuario Once', email: 'user11@demo.com', role: 'user' },
    { name: 'Usuario Doce', email: 'user12@demo.com', role: 'user' },
    { name: 'Usuario Trece', email: 'user13@demo.com', role: 'user' },
    { name: 'Usuario Catorce', email: 'user14@demo.com', role: 'user' },
    { name: 'Usuario Quince', email: 'user15@demo.com', role: 'user' },
    { name: 'Usuario Dieciséis', email: 'user16@demo.com', role: 'user' },
    { name: 'Usuario Diecisiete', email: 'user17@demo.com', role: 'user' },
    { name: 'Usuario Dieciocho', email: 'user18@demo.com', role: 'user' },
    { name: 'Usuario Diecinueve', email: 'user19@demo.com', role: 'user' },
    { name: 'Usuario Veinte', email: 'user20@demo.com', role: 'user' },
    { name: 'Usuario Veintiuno', email: 'user21@demo.com', role: 'user' },
    { name: 'Usuario Veintidós', email: 'user22@demo.com', role: 'user' },
    { name: 'Usuario Veintitrés', email: 'user23@demo.com', role: 'user' },
    { name: 'Usuario Veinticuatro', email: 'user24@demo.com', role: 'user' },
    { name: 'Usuario Veinticinco', email: 'user25@demo.com', role: 'user' },
];
function cargarCursosDesdeJSON() {
    return __awaiter(this, void 0, void 0, function () {
        var cursosDir, archivos, cursos, _i, archivos_1, archivo, filePath, data, curso;
        return __generator(this, function (_a) {
            cursosDir = path.join(__dirname, '../public/cursos-data');
            archivos = fs_1.default.readdirSync(cursosDir).filter(function (f) { return f.endsWith('.json'); });
            cursos = [];
            for (_i = 0, archivos_1 = archivos; _i < archivos_1.length; _i++) {
                archivo = archivos_1[_i];
                filePath = path.join(cursosDir, archivo);
                data = fs_1.default.readFileSync(filePath, 'utf-8');
                curso = JSON.parse(data);
                // Adaptar campos si es necesario
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
            return [2 /*return*/, cursos];
        });
    });
}
function migrarCursos() {
    return __awaiter(this, void 0, void 0, function () {
        var cursosJSON, todosLosCursos, _i, todosLosCursos_1, curso, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Iniciando migración de cursos...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, cargarCursosDesdeJSON()];
                case 2:
                    cursosJSON = _a.sent();
                    todosLosCursos = __spreadArray(__spreadArray([], cursosEjemplo, true), cursosJSON, true);
                    _i = 0, todosLosCursos_1 = todosLosCursos;
                    _a.label = 3;
                case 3:
                    if (!(_i < todosLosCursos_1.length)) return [3 /*break*/, 6];
                    curso = todosLosCursos_1[_i];
                    return [4 /*yield*/, cursos_1.cursosService.createCurso(curso)];
                case 4:
                    _a.sent();
                    console.log("Curso \"".concat(curso.titulo, "\" migrado exitosamente"));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Migración de cursos completada exitosamente');
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error durante la migración de cursos:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function crearUsuarios() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, usuarios_1, usuario, userRef, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Iniciando creación de usuarios...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _i = 0, usuarios_1 = usuarios;
                    _a.label = 2;
                case 2:
                    if (!(_i < usuarios_1.length)) return [3 /*break*/, 5];
                    usuario = usuarios_1[_i];
                    userRef = db.collection('users').doc();
                    return [4 /*yield*/, userRef.set(__assign(__assign({}, usuario), { createdAt: new Date().toISOString() }))];
                case 3:
                    _a.sent();
                    console.log("Usuario \"".concat(usuario.email, "\" creado exitosamente"));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Todos los usuarios fueron creados.');
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error al crear usuarios:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function inicializarBaseDeDatos() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, migrarCursos()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, crearUsuarios()];
                case 2:
                    _a.sent();
                    console.log('Inicialización de la base de datos completada.');
                    return [2 /*return*/];
            }
        });
    });
}
// Ejecutar la inicialización
inicializarBaseDeDatos();
