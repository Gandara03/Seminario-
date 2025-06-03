import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc
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