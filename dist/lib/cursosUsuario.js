"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarProgresoCurso = exports.quitarCursoUsuario = exports.agregarCursoUsuario = exports.getCursosUsuario = void 0;
exports.useFavoritosCursos = useFavoritosCursos;
const firebase_1 = require("./firebase");
const firestore_1 = require("firebase/firestore");
const react_1 = require("react");
const AuthContext_1 = require("@/lib/AuthContext");
const getCursosUsuario = async (uid, tipo) => {
    const ref = (0, firestore_1.collection)(firebase_1.db, `users/${uid}/${tipo}`);
    const snapshot = await (0, firestore_1.getDocs)(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
exports.getCursosUsuario = getCursosUsuario;
const agregarCursoUsuario = async (uid, tipo, curso) => {
    if (tipo === 'favoritos') {
        await fetch('/api/perfil/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, curso })
        });
        return;
    }
    const ref = (0, firestore_1.doc)(firebase_1.db, `users/${uid}/${tipo}/${curso.id}`);
    await (0, firestore_1.setDoc)(ref, curso, { merge: true });
};
exports.agregarCursoUsuario = agregarCursoUsuario;
const quitarCursoUsuario = async (uid, tipo, cursoId) => {
    if (tipo === 'favoritos') {
        await fetch('/api/perfil/favoritos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, cursoId })
        });
        return;
    }
    const ref = (0, firestore_1.doc)(firebase_1.db, `users/${uid}/${tipo}/${cursoId}`);
    await (0, firestore_1.deleteDoc)(ref);
};
exports.quitarCursoUsuario = quitarCursoUsuario;
const actualizarProgresoCurso = async (uid, cursoId, progreso) => {
    const ref = (0, firestore_1.doc)(firebase_1.db, `users/${uid}/enProgreso/${cursoId}`);
    await (0, firestore_1.updateDoc)(ref, { progreso });
};
exports.actualizarProgresoCurso = actualizarProgresoCurso;
function useFavoritosCursos() {
    const { user } = (0, AuthContext_1.useAuth)();
    const [favoritos, setFavoritos] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!user)
            return;
        setLoading(true);
        (0, exports.getCursosUsuario)(user.uid, 'favoritos')
            .then((cursos) => setFavoritos(cursos.map((c) => c.id)))
            .finally(() => setLoading(false));
    }, [user]);
    const addFavorito = async (curso) => {
        if (!user)
            return;
        await (0, exports.agregarCursoUsuario)(user.uid, 'favoritos', curso);
        setFavoritos((prev) => [...prev, curso.id]);
    };
    const removeFavorito = async (cursoId) => {
        if (!user)
            return;
        await (0, exports.quitarCursoUsuario)(user.uid, 'favoritos', cursoId);
        setFavoritos((prev) => prev.filter((id) => id !== cursoId));
    };
    const isFavorito = (cursoId) => favoritos.includes(cursoId);
    return { favoritos, loading, addFavorito, removeFavorito, isFavorito };
}
