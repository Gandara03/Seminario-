import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import * as serviceAccount from '@/serviceAccountKey.json';

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}
const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ ok: false, error: 'UID requerido' }, { status: 400 });
    const enProgresoSnap = await db.collection(`users/${uid}/enProgreso`).get();
    const completadosSnap = await db.collection(`users/${uid}/completados`).get();
    const favoritosSnap = await db.collection(`users/${uid}/favoritos`).get();
    const enProgreso = enProgresoSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const completados = completadosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const favoritos = favoritosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, enProgreso, completados, favoritos });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
} 