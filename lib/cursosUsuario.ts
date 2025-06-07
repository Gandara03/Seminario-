import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  addDoc,
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export const getCursosUsuario = async (uid: string, tipo: 'enProgreso' | 'completados' | 'favoritos' | 'guardados') => {
  const ref = collection(db, `users/${uid}/${tipo}`);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const agregarCursoUsuario = async (uid: string, tipo: 'enProgreso' | 'completados' | 'favoritos' | 'guardados', curso: any) => {
  const cursoId = curso.id || curso.cursoId || curso._id;
  if (tipo === 'favoritos') {
    await fetch('/api/perfil/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, curso: { ...curso, id: cursoId } })
    });
    return;
  }
  const ref = doc(db, `users/${uid}/${tipo}/${cursoId}`);
  await setDoc(ref, { ...curso, id: cursoId }, { merge: true });
};

export const quitarCursoUsuario = async (uid: string, tipo: 'enProgreso' | 'completados' | 'favoritos' | 'guardados', cursoId: string) => {
  if (tipo === 'favoritos') {
    await fetch('/api/perfil/favoritos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, cursoId })
    });
    return;
  }
  const ref = doc(db, `users/${uid}/${tipo}/${cursoId}`);
  await deleteDoc(ref);
};

export const actualizarProgresoCurso = async (uid: string, cursoId: string, progreso: number) => {
  const ref = doc(db, `users/${uid}/enProgreso/${cursoId}`);
  await updateDoc(ref, { progreso });
};

export function useFavoritosCursos() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getCursosUsuario(user.uid, 'favoritos')
      .then((cursos) => setFavoritos(cursos.map((c: any) => c.id)))
      .finally(() => setLoading(false));
  }, [user]);

  const addFavorito = async (curso: any) => {
    if (!user) return;
    await agregarCursoUsuario(user.uid, 'favoritos', curso);
    setFavoritos((prev) => [...prev, curso.id]);
  };

  const removeFavorito = async (cursoId: string) => {
    if (!user) return;
    await quitarCursoUsuario(user.uid, 'favoritos', cursoId);
    setFavoritos((prev) => prev.filter((id) => id !== cursoId));
  };

  const isFavorito = (cursoId: string) => favoritos.includes(cursoId);

  return { favoritos, loading, addFavorito, removeFavorito, isFavorito };
}

// Función para agregar un comentario a un curso
export const agregarComentarioCurso = async (cursoId: string, comentario: any) => {
  try {
    const cursoRef = doc(db, 'cursos', cursoId);
    const cursoDoc = await getDoc(cursoRef);
    
    if (!cursoDoc.exists()) {
      console.error('El curso no existe');
      return false;
    }

    const cursoData = cursoDoc.data();
    const comentariosActuales = cursoData.comentarios || [];
    
    // Verificar si el comentario ya existe (por timestamp y userId)
    const comentarioDuplicado = comentariosActuales.some(
      (c: any) => c.timestamp === comentario.timestamp && c.userId === comentario.userId
    );

    if (comentarioDuplicado) {
      console.error('El comentario ya existe');
      return false;
    }

    // Agregar el nuevo comentario al inicio del array
    const nuevosComentarios = [comentario, ...comentariosActuales];
    
    await updateDoc(cursoRef, {
      comentarios: nuevosComentarios
    });

    return true;
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    return false;
  }
};

// Función para obtener los comentarios de un curso
export const getComentariosCurso = async (cursoId: string) => {
  try {
    const cursoRef = doc(db, 'cursos', cursoId);
    const cursoDoc = await getDoc(cursoRef);
    
    if (!cursoDoc.exists()) {
      console.error('El curso no existe');
      return [];
    }

    const cursoData = cursoDoc.data();
    const comentarios = cursoData.comentarios || [];
    
    // Ordenar comentarios por fecha (más recientes primero)
    return comentarios.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return [];
  }
}; 