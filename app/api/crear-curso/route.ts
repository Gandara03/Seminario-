import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // @ts-ignore
      const formData = await req.formData();
      const data: any = {};
      for (const [key, value] of formData.entries()) {
        if (key === 'imagenFile' && value instanceof File) {
          if (!value.type.startsWith('image/')) {
            return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
          }
          const ext = value.name.split('.').pop();
          const imgName = `curso-${Date.now()}.${ext}`;
          const imgPath = path.join(process.cwd(), 'public', 'cursos', imgName);
          const arrayBuffer = await value.arrayBuffer();
          await fs.writeFile(imgPath, Buffer.from(arrayBuffer));
          data.imagen = `/cursos/${imgName}`;
        } else {
          data[key] = value;
        }
      }
      // Procesar campos de texto complejos
      data.requisitos = (data.requisitos || '').split('\n').map((r: string) => r.trim()).filter(Boolean);
      data.temario = (data.temario || '').split('\n').map((t: string) => t.trim()).filter(Boolean);
      data.materiales = (data.materiales || '').split('\n').map((m: string) => {
        const [nombre, url] = m.split('|');
        return nombre && url ? { nombre: nombre.trim(), url: url.trim() } : null;
      }).filter(Boolean);
      data.id = Date.now();
      if (!data.nombre || !data.categoria || !data.descripcion) {
        return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
      }
      const fileName = `curso-${data.id}.json`;
      const filePath = path.join(process.cwd(), 'public', 'cursos-data', fileName);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return NextResponse.json({ ok: true, file: fileName });
    } else {
      return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar el curso' }, { status: 500 });
  }
} 