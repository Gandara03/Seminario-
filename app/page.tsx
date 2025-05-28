"use client";
import Link from "next/link"
import { Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Lista fija de categorías principales
const categoriasPrincipales = [
  "Todos",
  "Desarrollo Web",
  "Diseño",
  "Marketing",
  "Idiomas",
  "Negocios",
  "Datos"
];

export default function Home() {
  const { data: session } = useSession();
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [nivelSeleccionado, setNivelSeleccionado] = useState("Dificultad");
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("recientes");

  const categorias = [
    "Todos",
    ...Array.from(new Set(cursos.flatMap(c => c.temario || []))).filter(Boolean)
  ];
  const niveles = ["Dificultad", ...Array.from(new Set(cursos.map(c => c.nivel))).filter(Boolean)];
  const ordenes = [
    { value: "recientes", label: "Más recientes" },
    { value: "populares", label: "Más populares" },
    { value: "calificacion", label: "Mejor calificados" },
  ];

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      const ids = [1,2,3,4,5,6];
      const cursosData = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/cursos-data/curso-${id}.json`);
          if (!res.ok) return null;
          const data = await res.json();
          return data;
        })
      );
      setCursos(cursosData.filter(Boolean));
      setLoading(false);
    }
    fetchCursos();
  }, []);

  // Lógica de filtrado SOLO para búsqueda y categorías
  const cursosBusqueda = cursos.filter(curso => {
    const coincideCategoria = categoriaSeleccionada === "Todos" || curso.categoria === categoriaSeleccionada;
    const coincideNombre = curso.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideNivel = nivelSeleccionado === "Dificultad" || curso.nivel === nivelSeleccionado;
    return coincideCategoria && coincideNombre && coincideNivel;
  });

  // Cursos populares: SIEMPRE los más populares, sin verse afectados por búsqueda/filtros
  const cursosPopulares = [...cursos]
    .sort((a, b) => (b.estudiantes || 0) - (a.estudiantes || 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                {(session.user as any).role === "admin" && (
                  <Button asChild>
                    <Link href="/admin">Panel de administrador</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/perfil">Mi perfil</Link>
                </Button>
                <Button asChild>
                  <Link href="/api/auth/signout">Cerrar sesión</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-emerald-600">
                  Iniciar sesión
                </Link>
                <Button asChild>
                  <Link href="/auth?register=true">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Aprende a tu ritmo, crece sin límites</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre cientos de cursos impartidos por expertos y desarrolla las habilidades que necesitas para alcanzar
            tus metas.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Buscar cursos..."
                className="pl-10 pr-4 py-6 rounded-full"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <Select value={nivelSeleccionado} onValueChange={setNivelSeleccionado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                {niveles.map((nivel) => (
                  <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Resultados de búsqueda (solo si hay texto) */}
      {busqueda.trim() !== "" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6 text-left">Resultados de búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
              ) : cursosBusqueda.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No se encontraron cursos para tu búsqueda.</div>
              ) : (
                cursosBusqueda.map((curso) => (
                  <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={curso.imagen?.startsWith('/') ? curso.imagen : `/cursos/${curso.imagen}`}
                      alt={curso.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="text-sm text-emerald-600 mb-2">{curso.categoria}</div>
                      <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Dificultad: {curso.nivel}</div>
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
          </div>
        </section>
      )}

      {/* Categorías destacadas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Categorías destacadas</h2>
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categoriasPrincipales.map((cat) => (
              <Button
                key={cat}
                variant={cat === categoriaSeleccionada ? "default" : "outline"}
                className={cat === categoriaSeleccionada ? "" : "text-gray-600"}
                onClick={() => setCategoriaSeleccionada(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados por categoría (solo si hay categoría seleccionada y no hay texto) */}
      {busqueda.trim() === "" && categoriaSeleccionada !== "Todos" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6 text-left">Cursos de {categoriaSeleccionada}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
              ) : cursosBusqueda.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No hay cursos en esta categoría.</div>
              ) : (
                cursosBusqueda.map((curso) => (
                  <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={curso.imagen?.startsWith('/') ? curso.imagen : `/cursos/${curso.imagen}`}
                      alt={curso.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="text-sm text-emerald-600 mb-2">{curso.categoria}</div>
                      <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Dificultad: {curso.nivel}</div>
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
          </div>
        </section>
      )}

      {/* Cursos populares */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Cursos populares</h2>
            <Link href="/cursos" className="text-emerald-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
            ) : cursosPopulares.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No hay cursos populares.</div>
            ) : (
              cursosPopulares.map((curso) => (
                <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={curso.imagen?.startsWith('/') ? curso.imagen : `/cursos/${curso.imagen}`}
                    alt={curso.nombre}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <div className="text-sm text-emerald-600 mb-2">{curso.categoria}</div>
                    <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Dificultad: {curso.nivel}</div>
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
        </div>
      </section>
    </div>
  )
}
