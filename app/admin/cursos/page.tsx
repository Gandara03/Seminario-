"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import CursosTable from "@/components/CursosTable";

interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: string;
  duracion: string;
  requisitos?: string[];
  temario?: string[];
  materiales?: { nombre: string; url: string }[];
  modulos?: any[];
  comentarios?: any[];
  imagen?: string;
}

export default function CursosAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.replace("/");
    }
  }, [status, session, router]);

  // Cargar cursos dinámicamente desde los JSON
  useEffect(() => {
    async function fetchCursos() {
      try {
        // Obtener la lista de archivos JSON en /public/cursos-data/
        const response = await fetch("/api/cursos-list");
        const files: string[] = await response.json();
        // Leer cada archivo JSON
        const cursosData = await Promise.all(
          files.map(async (file) => {
            const res = await fetch(`/cursos-data/${file}`);
            return await res.json();
          })
        );
        setCursos(cursosData);
      } catch (error) {
        console.error("Error cargando cursos:", error);
      }
    }
    fetchCursos();
  }, []);

  if (status === "loading") return <div>Cargando...</div>;
  if (status === "unauthenticated") return <div>No autorizado</div>;

  // Filtrado avanzado por nombre, descripción, instructor, etc.
  const cursosFiltrados = cursos.filter((curso) => {
    const term = searchTerm.toLowerCase();
    return (
      curso.nombre.toLowerCase().includes(term) ||
      (curso.descripcion && curso.descripcion.toLowerCase().includes(term)) ||
      (curso.nivel && curso.nivel.toLowerCase().includes(term)) ||
      (curso.duracion && curso.duracion.toLowerCase().includes(term))
    );
  });

  const handleEliminarCurso = (id: number) => {
    setCursos(cursos.filter((curso) => curso.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
        <Button onClick={() => router.push('/admin/cursos/nuevo')} className="flex items-center gap-2">
          <Plus size={16} /> Nuevo curso
        </Button>
      </div>
      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Buscar cursos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <CursosTable
        cursos={cursosFiltrados}
        columns={[
          { key: "nombre", label: "Curso" },
          { key: "descripcion", label: "Descripción" },
          { key: "nivel", label: "Nivel" },
          { key: "duracion", label: "Duración" },
          { key: "materiales", label: "Materiales" },
          { key: "imagen", label: "Imagen" },
        ]}
        onDelete={handleEliminarCurso}
      />
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo curso</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                const category = (form.elements.namedItem("category") as HTMLInputElement).value;
                const instructor = (form.elements.namedItem("instructor") as HTMLInputElement).value;
                const status = (form.elements.namedItem("status") as HTMLInputElement).value;
                let videoUrl = videoFile ? URL.createObjectURL(videoFile) : undefined;
                let pdfUrl = pdfFile ? URL.createObjectURL(pdfFile) : undefined;
                let imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
                setCursos([
                  ...cursos,
                  {
                    id: cursos.length + 1,
                    nombre: title,
                    descripcion: category,
                    nivel: instructor,
                    duracion: status,
                    requisitos: [],
                    temario: [],
                    materiales: [],
                    modulos: [],
                    comentarios: [],
                    imagen: imageUrl,
                  },
                ]);
                setShowModal(false);
                setVideoFile(null);
                setPdfFile(null);
                setImageFile(null);
              }}
            >
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Nombre del curso</label>
                <input name="title" className="border rounded w-full p-2" required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input name="category" className="border rounded w-full p-2" required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Nivel</label>
                <input name="instructor" className="border rounded w-full p-2" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select name="status" className="border rounded w-full p-2" required>
                  <option value="Publicado">Publicado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Borrador">Borrador</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Video (opcional)</label>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">PDF (opcional)</label>
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Imagen (opcional)</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setVideoFile(null); setPdfFile(null); setImageFile(null); }}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 