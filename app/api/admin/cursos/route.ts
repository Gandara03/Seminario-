import { NextResponse } from 'next/server';
const admin = require('firebase-admin');
const { getApps } = require('firebase-admin/app');
const serviceAccount = require('../../../../serviceAccountKey.json');

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export async function GET() {
  try {
    const snapshot = await db.collection('cursos').get();
    const cursos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, cursos });
  } catch (error) {
    console.error('🔥 ERROR en /api/admin/cursos:', error);
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
} 