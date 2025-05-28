"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, BookOpen, Bookmark, Settings, LogOut, ChevronRight, Heart } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Simulación de IDs de cursos del usuario (esto puede venir de backend o localStorage en el futuro)
const IDS_EN_PROGRESO = [1, 2];
const IDS_COMPLETADOS = [3];
const IDS_FAVORITOS = [1, 2];

export default function PerfilPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("en-progreso")
  const [cursos, setCursos] = useState<any[]>([]);
  const [nombre, setNombre] = useState(session?.user?.name || "Juan Pérez");
  const [correo, setCorreo] = useState(session?.user?.email || "juan@ejemplo.com");

  useEffect(() => {
    if (session?.user) {
      setNombre(session.user.name || "");
      setCorreo(session.user.email || "");
    }
  }, [session]);

  // Cargar cursos dinámicamente desde los JSON
  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await fetch("/api/cursos-list");
        const files: string[] = await response.json();
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

  // Simular progreso y favoritos (esto puede venir de backend o localStorage)
  const cursosEnProgreso = cursos.filter(c => IDS_EN_PROGRESO.includes(c.id)).map((c, i) => ({
    ...c,
    progress: [35, 68][i] || 20 // Simulación de progreso
  }));
  const cursosCompletados = cursos.filter(c => IDS_COMPLETADOS.includes(c.id)).map(c => ({
    ...c,
    completedDate: "15 de marzo, 2025"
  }));
  const favorites = cursos.filter(c => IDS_FAVORITOS.includes(c.id)).map(c => ({
    ...c,
    savedDate: "15 de abril, 2024"
  }));
  const recomendados = cursos.filter(c => !IDS_EN_PROGRESO.includes(c.id) && !IDS_COMPLETADOS.includes(c.id));

  const removeFavorite = (id: number) => {
    // Simulación: solo quita del array local
    // En el futuro, actualizar en backend/localStorage
  };

  const marcarComoCompletado = (cursoId: number) => {
    // Simulación: solo mueve entre arrays locales
    // En el futuro, actualizar en backend/localStorage
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{nombre.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="text-xl">{nombre.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{nombre}</h2>
                <p className="text-gray-500">{correo}</p>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/perfil" className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    <span>Mis cursos</span>
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/perfil/guardados" className="flex items-center">
                    <Bookmark className="mr-2 h-5 w-5" />
                    <span>Guardados</span>
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/perfil/editar" className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    <span>Editar perfil</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg border p-6 mb-8">
              <h1 className="text-2xl font-bold mb-6">Mis cursos</h1>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="en-progreso">En progreso</TabsTrigger>
                  <TabsTrigger value="completados">Completados</TabsTrigger>
                  <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                  <TabsTrigger value="configuracion">Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value="en-progreso">
                  <div className="space-y-6">
                    {cursosEnProgreso.length === 0 && (
                      <div className="text-gray-500 text-center py-8">No tienes cursos en progreso.</div>
                    )}
                    {cursosEnProgreso.map((curso) => (
                      <Card key={curso.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <img
                              src={curso.imagen || "/placeholder.svg"}
                              alt={curso.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                                <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                                <div className="mb-4">
                                  <div className="flex justify-between mb-1 text-sm">
                                    <span>Progreso</span>
                                    <span>{curso.progress}%</span>
                                  </div>
                                  <Progress value={curso.progress} className="h-2" />
                                </div>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <Button asChild>
                                  <Link href={`/cursos/${curso.id}`}>Continuar</Link>
                                </Button>
                                <Button variant="outline" onClick={() => marcarComoCompletado(curso.id)}>
                                  Marcar como completado
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="completados">
                  <div className="space-y-6">
                    {cursosCompletados.length === 0 && (
                      <div className="text-gray-500 text-center py-8">No tienes cursos completados.</div>
                    )}
                    {cursosCompletados.map((curso) => (
                      <Card key={curso.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <img
                              src={curso.imagen || "/placeholder.svg"}
                              alt={curso.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                                <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                                <div className="flex items-center text-emerald-600 mb-4">
                                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>Completado</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Completado el: {curso.completedDate}</span>
                                <Button variant="outline" asChild>
                                  <Link href={`/cursos/${curso.id}`}>Ver curso</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="favoritos">
                  <div className="space-y-6">
                    {favorites.map((curso) => (
                      <Card key={curso.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <img
                              src={curso.imagen || "/placeholder.svg"}
                              alt={curso.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                                <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                                <div className="flex items-center text-gray-500 mb-4">
                                  <Heart className="w-4 h-4 mr-1 text-red-500 fill-current" />
                                  <span className="text-sm">Guardado en favoritos</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Guardado el: {curso.savedDate}</span>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => removeFavorite(curso.id)}>
                                    <Heart className="w-4 h-4 mr-1 text-red-500 fill-current" />
                                    <span>Quitar</span>
                                  </Button>
                                  <Button asChild>
                                    <Link href={`/cursos/${curso.id}`}>Ver curso</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="configuracion">
                  <div className="max-w-md mx-auto mt-8">
                    <h2 className="text-xl font-bold mb-4">Editar perfil</h2>
                    <form className="space-y-6 bg-gray-50 p-6 rounded-lg border" onSubmit={e => {e.preventDefault();}}>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                          className="border rounded w-full p-2"
                          value={nombre}
                          onChange={e => setNombre(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                        <input
                          className="border rounded w-full p-2"
                          type="email"
                          value={correo}
                          onChange={e => setCorreo(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Guardar cambios</Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {activeTab === "en-progreso" && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-6">Recomendados para ti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recomendados.map((curso) => (
                    <Card key={curso.id} className="overflow-hidden">
                      <img
                        src={curso.imagen || "/placeholder.svg"}
                        alt={curso.nombre}
                        className="w-full h-40 object-cover"
                      />
                      <CardContent className="p-4">
                        <div className="text-sm text-emerald-600 mb-1">{curso.nivel}</div>
                        <h3 className="text-lg font-semibold mb-3">{curso.nombre}</h3>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/cursos/${curso.id}`}>
                            Ver detalles
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
