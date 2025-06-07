import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}
const db = admin.firestore();

async function listarCursos() {
  const snapshot = await db.collection('cursos').get();
  if (snapshot.empty) {
    console.log('No hay cursos en la colección.');
    return;
  }
  snapshot.forEach(doc => {
    console.log('ID:', doc.id);
    console.log(doc.data());
    console.log('-----------------------------');
  });
}

listarCursos().then(() => process.exit(0)); 