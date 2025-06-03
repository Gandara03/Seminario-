import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import serviceAccount from '../../../../serviceAccountKey.json';

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'eduplus-2cadd.appspot.com',
  });
}
const db = getFirestore();
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'eduplus-2cadd.appspot.com';
const bucket = admin.storage().bucket(bucketName);

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // @ts-ignore
      const formData = await req.formData();
      const data: any = {};
      let imageUrl = '';
      for (const [key, value] of formData.entries()) {
        if (key === 'imagenFile' && value instanceof File) {
          if (!value.type.startsWith('image/')) {
            return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
          }
          const ext = value.name.split('.').pop();
          const imgName = `curso-editado-${params.id}.${ext}`;
          const buffer = Buffer.from(await value.arrayBuffer());
          const file = bucket.file(imgName);
          await file.save(buffer, { contentType: value.type });
          await file.makePublic();
          imageUrl = `https://storage.googleapis.com/${bucket.name}/${imgName}`;
        } else {
          data[key] = value;
        }
      }
      // Procesar campos complejos igual que en crear-curso
      data.requisitos = (data.requisitos || '').split('\n').map((r: string) => r.trim()).filter(Boolean);
      data.temario = (data.temario || '').split('\n').map((t: string) => t.trim()).filter(Boolean);
      data.materiales = (data.materiales || '').split('\n').map((m: string) => {
        const [nombre, url] = m.split('|');
        return nombre && url ? { nombre: nombre.trim(), url: url.trim() } : null;
      }).filter(Boolean);
      if (typeof data.modulos === 'string') {
        try {
          data.modulos = JSON.parse(data.modulos).map((mod: any) => ({
            titulo: mod.titulo || '',
            contenido: mod.contenido || '',
            materiales: Array.isArray(mod.materiales) ? mod.materiales : [],
            videoUrl: mod.videoUrl || ''
          }));
        } catch {
          data.modulos = [];
        }
      }
      if (imageUrl) data.imagen = imageUrl;
      data.titulo = data.nombre || data.titulo || '';
      data.comentarios = Array.isArray(data.comentarios) ? data.comentarios : [];
      data.descripcion = data.descripcion || '';
      data.nivel = data.nivel || '';
      data.duracion = data.duracion || '';
      data.categoria = data.categoria || '';
      data.requisitos = Array.isArray(data.requisitos) ? data.requisitos : [];
      data.temario = Array.isArray(data.temario) ? data.temario : [];
      data.materiales = Array.isArray(data.materiales) ? data.materiales : [];
      data.modulos = Array.isArray(data.modulos) ? data.modulos : [];
      if (!data.titulo || !data.categoria || !data.descripcion) {
        return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
      }
      await db.collection('cursos').doc(params.id).update(data);
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al editar el curso', details: error?.message }, { status: 500 });
  }
} 