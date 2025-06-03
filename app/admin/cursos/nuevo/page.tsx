"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function NuevoCursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    nivel: "Básico",
    duracion: "",
    requisitos: "",
    temario: "",
    materiales: "",
    imagen: "",
  });
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [numModulos, setNumModulos] = useState(1);
  const [modulos, setModulos] = useState([{ titulo: '', contenido: '', videoUrl: '', materiales: [{ nombre: '', url: '' }] }]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImagenFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  const handleNumModulosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cantidad = Math.max(1, parseInt(e.target.value) || 1);
    setNumModulos(cantidad);
    setModulos((prev) => {
      if (cantidad > prev.length) {
        return [
          ...prev,
          ...Array(cantidad - prev.length).fill({ titulo: '', contenido: '', videoUrl: '', materiales: [{ nombre: '', url: '' }] })
        ];
      } else {
        return prev.slice(0, cantidad);
      }
    });
  };

  const handleModuloChange = (idx: number, field: 'titulo' | 'contenido' | 'videoUrl', value: string) => {
    setModulos((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleMaterialChange = (modIdx: number, matIdx: number, field: 'nombre' | 'url', value: string) => {
    setModulos((prev) => prev.map((m, i) =>
      i === modIdx
        ? { ...m, materiales: m.materiales.map((mat: any, j: number) => j === matIdx ? { ...mat, [field]: value } : mat) }
        : m
    ));
  };

  const addMaterial = (modIdx: number) => {
    setModulos((prev) => prev.map((m, i) =>
      i === modIdx ? { ...m, materiales: [...m.materiales, { nombre: '', url: '' }] } : m
    ));
  };

  const removeMaterial = (modIdx: number, matIdx: number) => {
    setModulos((prev) => prev.map((m, i) =>
      i === modIdx ? { ...m, materiales: m.materiales.filter((_: any, j: number) => j !== matIdx) } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imagenFile) formData.append("imagenFile", imagenFile);
      formData.append("modulos", JSON.stringify(modulos));
      const res = await fetch("/api/crear-curso", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error al guardar el curso");
      setSuccess("¡Curso creado exitosamente!");
      setTimeout(() => router.push("/admin/cursos"), 1200);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Crear nuevo curso</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block font-medium mb-1">Nombre</label>
          <Input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Categoría</label>
          <Input name="categoria" value={form.categoria} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Descripción</label>
          <Textarea name="descripcion" value={form.descripcion} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Nivel</label>
          <Input name="nivel" value={form.nivel} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Duración</label>
          <Input name="duracion" value={form.duracion} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Requisitos (uno por línea)</label>
          <Textarea name="requisitos" value={form.requisitos} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium mb-1">Temario (uno por línea)</label>
          <Textarea name="temario" value={form.temario} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium mb-1">Materiales (nombre | url, uno por línea)</label>
          <Textarea name="materiales" value={form.materiales} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium mb-1">Imagen del curso</label>
          <Input type="file" accept="image/*" onChange={handleImagenChange} />
          {preview && (
            <div className="mt-2">
              <Image src={preview} alt="Previsualización" width={120} height={80} className="rounded border" />
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Cantidad de módulos</label>
          <Input type="number" min={1} value={numModulos} onChange={handleNumModulosChange} required />
        </div>
        {modulos.map((mod, idx) => (
          <div key={idx} className="border rounded p-3 mb-2 bg-gray-50">
            <label className="block font-medium mb-1">Módulo {idx + 1} - Título</label>
            <Input value={mod.titulo} onChange={e => handleModuloChange(idx, 'titulo', e.target.value)} required />
            <label className="block font-medium mb-1 mt-2">Contenido</label>
            <Textarea value={mod.contenido} onChange={e => handleModuloChange(idx, 'contenido', e.target.value)} required />
            <label className="block font-medium mb-1 mt-2">Video (URL)</label>
            <Input value={mod.videoUrl} onChange={e => handleModuloChange(idx, 'videoUrl', e.target.value)} placeholder="https://..." />
            <label className="block font-medium mb-1 mt-2">Materiales</label>
            {mod.materiales.map((mat, matIdx) => (
              <div key={matIdx} className="flex gap-2 mb-2">
                <Input
                  value={mat.nombre}
                  onChange={e => handleMaterialChange(idx, matIdx, 'nombre', e.target.value)}
                  placeholder="Nombre del material"
                  className="w-1/2"
                />
                <Input
                  value={mat.url}
                  onChange={e => handleMaterialChange(idx, matIdx, 'url', e.target.value)}
                  placeholder="URL"
                  className="w-1/2"
                />
                <Button type="button" variant="destructive" onClick={() => removeMaterial(idx, matIdx)} disabled={mod.materiales.length === 1}>-</Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addMaterial(idx)} className="mb-2">Agregar material</Button>
          </div>
        ))}
        {error && <div className="text-red-600 font-medium">{error}</div>}
        {success && <div className="text-green-600 font-medium">{success}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/cursos")}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar curso"}</Button>
        </div>
      </form>
    </div>
  );
} 