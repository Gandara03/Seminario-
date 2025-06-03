"use client";
import Link from "next/link"
import { Play, Download, Star, CheckCircle, BookOpen, Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState, use } from "react"
import { useAuth } from '@/lib/AuthContext';
import { agregarCursoUsuario, getCursosUsuario } from '@/lib/cursosUsuario';

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function CursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const { id } = use(params);
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [completados, setCompletados] = useState<boolean[]>([]);
  const { user, isAdmin, logout } = useAuth();
  const [inscrito, setInscrito] = useState(false);

  useEffect(() => {
    async function fetchCurso() {
      setLoading(true);
      const res = await fetch(`/api/cursos/${id}`);
      if (!res.ok) {
        setCurso(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCurso(data);
      setComments(data.comentarios || []);
      setCompletados(Array((data.modulos || []).length).fill(false));
      setLoading(false);
    }
    fetchCurso();
  }, [id]);

  // Verificar si el usuario ya está inscrito en el curso
  useEffect(() => {
    if (!user || !curso) return;
    getCursosUsuario(user.uid, 'enProgreso').then((cursos) => {
      setInscrito(cursos.some((c: any) => c.id === curso.id));
    });
  }, [user, curso]);

  // Función para inscribirse
  const handleInscribirse = async () => {
    if (!user || !curso) return;
    await agregarCursoUsuario(user.uid, 'enProgreso', { ...curso, id: curso.id });
    setInscrito(true);
  };

  // Calcular porcentaje de avance
  const progreso = completados.length > 0 ? Math.round((completados.filter(Boolean).length / completados.length) * 100) : 0;
  // Marcar/desmarcar módulo
  const toggleModulo = (idx: number) => {
    setCompletados(prev => prev.map((c, i) => (i === idx ? !c : c)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || rating === 0) return;
    const userName = session?.user?.name || "Anónimo";
    const today = new Date();
    const date = today.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    setComments([
      {
        usuario: userName,
        fecha: date,
        calificacion: rating,
        comentario: commentText,
      },
      ...comments,
    ]);
    setCommentText("");
    setRating(0);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Agregar función para extraer el ID de YouTube
  function extraerIdYoutube(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center text-lg text-gray-500">Cargando curso...</div>;
  }
  if (!curso) {
    return <div className="container mx-auto px-4 py-12 text-center text-lg text-red-500">Curso no encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild>
                    <Link href="/admin">Panel de administrador</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/perfil">Mi perfil</Link>
                </Button>
                <Button onClick={logout}>
                  Cerrar sesión
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

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-emerald-600">
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/cursos" className="text-gray-500 hover:text-emerald-600">
              Cursos
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">{curso.nombre}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            {/* Reproductor de video (primer módulo o imagen) */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-8 aspect-video flex items-center justify-center">
              <img
                src={`/cursos/${curso.imagen?.replace('/cursos/', '') || 'placeholder.svg'}`}
                alt={curso.nombre}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full ${isFavorite ? 'text-red-500' : 'text-white'}`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
              {/* Botón de inscripción */}
              {user && !inscrito && (
                <Button
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full shadow-lg text-lg"
                  onClick={handleInscribirse}
                >
                  Inscribirse gratis
                </Button>
              )}
              {user && inscrito && (
                <Button
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 px-8 py-3 rounded-full shadow text-lg cursor-default"
                  disabled
                >
                  Ya estás inscrito
                </Button>
              )}
            </div>

            {/* Tabs de contenido */}
            <Tabs defaultValue="descripcion" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
              </TabsList>
              <TabsContent value="descripcion" className="pt-6">
                <h2 className="text-2xl font-bold mb-4">{curso.nombre}</h2>
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Nivel: {curso.nivel}</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Duración: {curso.duracion}</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Requisitos: {curso.requisitos?.join(', ')}</span>
                </div>
                <p className="text-gray-700 mb-4">{curso.descripcion}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">Objetivos</h3>
                <ul className="list-disc pl-6 mb-6">
                  {curso.objetivos?.map((obj: string, idx: number) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
                <h3 className="text-xl font-semibold mb-4">Temario</h3>
                <ul className="list-decimal pl-6">
                  {curso.temario?.map((tema: string, idx: number) => (
                    <li key={idx}>{tema}</li>
                  ))}
                </ul>
                <h3 className="text-xl font-semibold mt-8 mb-4">Módulos</h3>
                <ul className="space-y-4">
                  {curso.modulos?.map((mod: any, idx: number) => (
                    <li key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span className="font-semibold">{mod.titulo}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{mod.contenido}</p>
                      {mod.videoUrl && (
                        <div className="relative w-full aspect-video mb-2">
                          {(mod.videoUrl.includes("youtube.com") || mod.videoUrl.includes("youtu.be")) ? (
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded"
                              src={`https://www.youtube.com/embed/${extraerIdYoutube(mod.videoUrl)}`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video controls className="absolute top-0 left-0 w-full h-full object-cover rounded">
                              <source src={mod.videoUrl} type="video/mp4" />
                              Tu navegador no soporta el video.
                            </video>
                          )}
                        </div>
                      )}
                      {mod.materiales && mod.materiales.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium">Materiales:</span>
                          <ul className="list-disc pl-6">
                            {mod.materiales.map((mat: any, i: number) => (
                              <li key={i}>
                                <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">{mat.nombre}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="material" className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Material del curso</h2>
                <div className="space-y-4">
                  {curso.materiales?.map((mat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-emerald-500" />
                        <span className="font-medium">{mat.nombre}</span>
                      </div>
                      <a href={mat.url} target="_blank" rel="noopener noreferrer">
                        <Button className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>Descargar</span>
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="comentarios" className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Comentarios de estudiantes</h2>
                <form onSubmit={handleSubmit} className="mb-8">
                  <Textarea
                    placeholder="Escribe tu comentario..."
                    className="mb-4"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Tu calificación:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <Button type="submit" disabled={!commentText || rating === 0}>
                      Enviar comentario
                    </Button>
                  </div>
                </form>
                <div className="space-y-6">
                  {comments.map((comment, index) => (
                    <div key={index} className="border-b pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{(comment.usuario || comment.name || "A").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{comment.usuario || comment.name}</h4>
                            <p className="text-sm text-gray-500">{comment.fecha || comment.date}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= (comment.calificacion || comment.rating) ? "text-yellow-400" : "text-gray-300"} fill-current`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.comentario || comment.comment}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Progreso del curso</h3>
              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Completado</span>
                  <span>{progreso}%</span>
                </div>
                <Progress value={progreso} className="h-2" />
              </div>
              <div className="space-y-4 mb-6">
                {curso.modulos?.map((mod: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleModulo(idx)}
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        completados[idx]
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300 bg-white text-gray-300"
                      }`}
                      aria-label={completados[idx] ? "Desmarcar módulo" : "Marcar como completado"}
                    >
                      {completados[idx] ? <CheckCircle className="h-4 w-4" /> : <div className="h-3 w-3 rounded-full" />}
                    </button>
                    <span className="text-sm">{mod.titulo}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mb-3" disabled={progreso < 100}>Finalizar curso</Button>
              <Button className="w-full" onClick={() => setCompletados(Array((curso.modulos || []).length).fill(false))}>
                Reiniciar progreso
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
