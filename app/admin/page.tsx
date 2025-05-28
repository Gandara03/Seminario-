"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  BarChart2,
  Users,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CursosTable from "@/components/CursosTable";

// Tipo para los cursos
interface Curso {
  id: number;
  title: string;
  category: string;
  instructor: string;
  status: string;
  students: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await fetch("/api/cursos-list");
        const files = await response.json();
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

  // Filtrado de cursos por búsqueda
  const cursosFiltrados = cursos.filter((curso) =>
    (curso.nombre ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Eliminar curso
  const handleEliminarCurso = (id: number) => {
    setCursos(cursos.filter((curso) => curso.id !== id));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {(session?.user as any)?.name}</h1>
        <p className="text-gray-600">Gestiona cursos, usuarios y contenido de la plataforma</p>
      </div>
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cursos.length}</div>
            <p className="text-xs text-emerald-600 mt-1">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Usuarios activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,845</div>
            <p className="text-xs text-emerald-600 mt-1">+8% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cursos completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,432</div>
            <p className="text-xs text-emerald-600 mt-1">+15% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>
      {/* Gestión de cursos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Gestión de cursos</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Tabla de cursos */}
        <CursosTable
          cursos={cursosFiltrados}
          columns={[
            { key: "nombre", label: "Curso" },
            { key: "categoria", label: "Categoría" },
            { key: "instructor", label: "Instructor" },
            { key: "status", label: "Estado" },
            { key: "students", label: "Estudiantes" },
          ]}
          onDelete={handleEliminarCurso}
        />
      </div>
      {/* Modal para nuevo curso (puedes agregarlo aquí si lo tienes implementado) */}
    </div>
  );
}

