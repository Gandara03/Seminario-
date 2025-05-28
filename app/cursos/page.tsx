"use client";

import Link from "next/link"
import { Search, Heart } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CursosPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const cursosPorPagina = 6;

  const categorias = [
    "Todos",
    ...Array.from(new Set(cursos.map(c => c.categoria))).filter(Boolean)
  ];

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      // Obtener la lista de archivos JSON (hardcodeado porque no hay API para listar archivos en public)
      const ids = [1,2,3,4,5,6];
      const cursosData = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/cursos-data/curso-${id}.json`);
          if (!res.ok) return null;
          const data = await res.json();
          // Agregar campo 'categoria' para los filtros
          data.categoria = data.temario?.[0] || "General";
          return data;
        })
      );
      setCursos(cursosData.filter(Boolean));
      setLoading(false);
    }
    fetchCursos();
  }, []);

  // Lógica de filtrado solo por búsqueda y categoría
  let cursosFiltrados = cursos.filter(curso => {
    const coincideCategoria = categoriaSeleccionada === "Todos" || curso.categoria === categoriaSeleccionada;
    const coincideNombre = curso.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideNombre;
  });

  // Paginación
  const totalPaginas = Math.ceil(cursosFiltrados.length / cursosPorPagina);
  const cursosPagina = cursosFiltrados.slice((paginaActual - 1) * cursosPorPagina, paginaActual * cursosPorPagina);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-emerald-600">
              Iniciar sesión
            </Link>
            <Button asChild>
              <Link href="/auth?register=true">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-emerald-600">
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">Cursos</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Explora nuestros cursos</h1>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar cursos..."
              className="pl-10 w-full"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={cat === categoriaSeleccionada ? "default" : "outline"}
              size="sm"
              className={cat === categoriaSeleccionada ? "" : "text-gray-600"}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Grid de cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
          ) : cursosPagina.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No se encontraron cursos.</div>
          ) : (
            cursosPagina.map((curso) => (
              <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={curso.imagen?.startsWith('/') ? curso.imagen : `/cursos/${curso.imagen}`}
                    alt={curso.nombre}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 rounded-full ${favorites.includes(curso.id) ? 'text-red-500' : 'text-white'}`}
                    onClick={() => toggleFavorite(curso.id)}
                  >
                    <Heart className={`h-6 w-6 ${favorites.includes(curso.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                  <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                  <div className="text-xs text-gray-500 mb-1 font-semibold">Duración: {curso.duracion}</div>
                  <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 ml-1">{curso.objetivos?.length || 0} objetivos</span>
                    </div>
                    <Link href={`/cursos/${curso.id}`} className="text-sm font-medium text-emerald-600 hover:underline">
                      Ver curso
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Paginación real */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)}>
                Anterior
              </Button>
              {Array.from({ length: totalPaginas }).map((_, idx) => (
                <Button
                  key={idx + 1}
                  variant={paginaActual === idx + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => cambiarPagina(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
