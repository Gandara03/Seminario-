"use client";
import Link from "next/link"
import { Play, Download, Star, CheckCircle, BookOpen, Heart, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState, use, useReducer } from "react"
import { useAuth } from '@/lib/AuthContext';
import { agregarCursoUsuario, getCursosUsuario, agregarComentarioCurso, getComentariosCurso } from '@/lib/cursosUsuario';

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Reducer para manejar el estado del curso
type CursoState = {
  moduloActual: number;
  completados: boolean[];
  isFavorite: boolean;
  comments: any[];
  commentText: string;
  rating: number;
};

type CursoAction = 
  | { type: 'SET_MODULO'; payload: number }
  | { type: 'TOGGLE_COMPLETADO'; payload: number }
  | { type: 'TOGGLE_FAVORITO' }
  | { type: 'ADD_COMMENT'; payload: any }
  | { type: 'SET_COMMENTS'; payload: any[] }
  | { type: 'SET_COMMENT_TEXT'; payload: string }
  | { type: 'SET_RATING'; payload: number }
  | { type: 'RESET_PROGRESS'; payload: number };

const cursoReducer = (state: CursoState, action: CursoAction): CursoState => {
  switch (action.type) {
    case 'SET_MODULO':
      return { ...state, moduloActual: action.payload };
    case 'TOGGLE_COMPLETADO':
      return {
        ...state,
        completados: state.completados.map((c, i) => 
          i === action.payload ? !c : c
        )
      };
    case 'TOGGLE_FAVORITO':
      return { ...state, isFavorite: !state.isFavorite };
    case 'ADD_COMMENT':
      return { ...state, comments: [action.payload, ...state.comments] };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'SET_COMMENT_TEXT':
      return { ...state, commentText: action.payload };
    case 'SET_RATING':
      return { ...state, rating: action.payload };
    case 'RESET_PROGRESS':
      return { ...state, completados: Array(action.payload).fill(false) };
    default:
      return state;
  }
};

// Componente de navegación del slider
const SliderNavigation = ({ 
  current, 
  total, 
  onPrev, 
  onNext, 
  onDotClick 
}: { 
  current: number; 
  total: number; 
  onPrev: () => void; 
  onNext: () => void; 
  onDotClick: (index: number) => void;
}) => (
  <>
    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
        disabled={current === 0}
        onClick={onPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
        disabled={current === total - 1}
        onClick={onNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          className={`w-3 h-3 rounded-full transition-all ${
            idx === current 
              ? 'bg-emerald-600 scale-125' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => onDotClick(idx)}
          aria-label={`Ir al módulo ${idx + 1}`}
        />
      ))}
    </div>
  </>
);

// Función para extraer el ID de YouTube
function extraerIdYoutube(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

// Componente de notificación
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
    type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
  }`}>
    <span>{message}</span>
    <button onClick={onClose} className="p-1 hover:opacity-70">
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default function CursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const { id } = use(params);
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, logout } = useAuth();
  const [inscrito, setInscrito] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [state, dispatch] = useReducer(cursoReducer, {
    moduloActual: 0,
    completados: [],
    isFavorite: false,
    comments: [],
    commentText: "",
    rating: 0
  });

  useEffect(() => {
    async function fetchCurso() {
      setLoading(true);
      try {
        const res = await fetch(`/api/cursos/${id}`);
        if (!res.ok) {
          setCurso(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCurso(data);
        
        // Obtener comentarios de Firebase
        const comentarios = await getComentariosCurso(id);
        if (comentarios && comentarios.length > 0) {
          dispatch({ type: 'SET_COMMENTS', payload: comentarios });
        }
        dispatch({ type: 'RESET_PROGRESS', payload: (data.modulos || []).length });
      } catch (error) {
        console.error('Error al cargar el curso:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurso();
  }, [id]);

  useEffect(() => {
    if (!user || !curso) return;
    getCursosUsuario(user.uid, 'enProgreso').then((cursos) => {
      setInscrito(cursos.some((c: any) => c.id === curso.id));
    });
  }, [user, curso]);

  const handleInscribirse = async () => {
    if (!user || !curso) return;
    await agregarCursoUsuario(user.uid, 'enProgreso', { ...curso, id: curso.id });
    setInscrito(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.commentText || state.rating === 0) return;
    
    if (!user) {
      setNotification({
        message: 'Debes iniciar sesión para comentar',
        type: 'error'
      });
      return;
    }
    
    const userName = user.displayName || user.email?.split('@')[0] || "Usuario";
    const today = new Date();
    const date = today.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    
    const nuevoComentario = {
      usuario: userName,
      fecha: date,
      calificacion: state.rating,
      comentario: state.commentText,
      userId: user.uid,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    };

    // Guardar comentario en Firebase
    const exito = await agregarComentarioCurso(id, nuevoComentario);
    
    if (exito) {
      dispatch({
        type: 'ADD_COMMENT',
        payload: nuevoComentario
      });
      dispatch({ type: 'SET_COMMENT_TEXT', payload: "" });
      dispatch({ type: 'SET_RATING', payload: 0 });
      setNotification({
        message: 'Comentario agregado exitosamente',
        type: 'success'
      });
    } else {
      setNotification({
        message: 'Error al guardar el comentario',
        type: 'error'
      });
    }

    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const progreso = state.completados.length > 0 
    ? Math.round((state.completados.filter(Boolean).length / state.completados.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Curso no encontrado</h2>
          <p className="text-gray-600 mb-4">El curso que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/cursos">Volver a cursos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const modulos = curso.modulos || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Header mejorado */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              EduPlus
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Button asChild variant="outline" className="hover:bg-emerald-50">
                      <Link href="/admin">Panel de administrador</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="hover:bg-emerald-50">
                    <Link href="/perfil">Mi perfil</Link>
                  </Button>
                  <Button onClick={logout} variant="ghost" className="text-gray-600 hover:text-red-600">
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                    Iniciar sesión
                  </Link>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/auth?register=true">Registrarse</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs mejorados */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-emerald-600 transition-colors">
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/cursos" className="text-gray-500 hover:text-emerald-600 transition-colors">
              Cursos
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800 font-medium">{curso.nombre}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            {/* Slider mejorado */}
            <div className="relative overflow-hidden mb-8 bg-white rounded-xl shadow-lg">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${state.moduloActual * 100}%)` }}
              >
                {modulos.map((mod: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="w-full flex-shrink-0"
                  >
                    <div className="relative bg-gray-900 rounded-t-xl overflow-hidden aspect-video">
                      {(mod.videoUrl && (mod.videoUrl.includes("youtube.com") || mod.videoUrl.includes("youtu.be"))) ? (
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${extraerIdYoutube(mod.videoUrl)}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : mod.videoUrl ? (
                        <video controls className="absolute top-0 left-0 w-full h-full object-cover">
                          <source src={mod.videoUrl} type="video/mp4" />
                          Tu navegador no soporta el video.
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <p className="text-white text-lg">No hay video disponible para este módulo</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{mod.titulo}</h3>
                      <p className="text-gray-600">{mod.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <SliderNavigation
                current={state.moduloActual}
                total={modulos.length}
                onPrev={() => dispatch({ type: 'SET_MODULO', payload: state.moduloActual - 1 })}
                onNext={() => dispatch({ type: 'SET_MODULO', payload: state.moduloActual + 1 })}
                onDotClick={(idx) => dispatch({ type: 'SET_MODULO', payload: idx })}
              />
            </div>

            {/* Tabs mejorados */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <Tabs defaultValue="descripcion" className="w-full">
                <TabsList className="w-full grid grid-cols-3 p-1 bg-gray-50">
                  <TabsTrigger value="descripcion" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Descripción
                  </TabsTrigger>
                  <TabsTrigger value="material" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Material
                  </TabsTrigger>
                  <TabsTrigger value="comentarios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Comentarios
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="descripcion" className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{curso.nombre}</h2>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                      Nivel: {curso.nivel}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Duración: {curso.duracion}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Requisitos: {curso.requisitos?.join(', ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{curso.descripcion}</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Objetivos</h3>
                      <ul className="space-y-2">
                        {curso.objetivos?.map((obj: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Temario</h3>
                      <ul className="space-y-2">
                        {curso.temario?.map((tema: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-medium">{idx + 1}.</span>
                            <span>{tema}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="material" className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Material del curso</h2>
                  <div className="space-y-4">
                    {curso.materiales?.map((mat: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:border-emerald-500 transition-colors">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium">{mat.nombre}</span>
                        </div>
                        <a href={mat.url} target="_blank" rel="noopener noreferrer">
                          <Button className="flex items-center gap-2 hover:bg-emerald-600">
                            <Download className="h-4 w-4" />
                            <span>Descargar</span>
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="comentarios" className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Comentarios de estudiantes</h2>
                  <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <Textarea
                      placeholder="Escribe tu comentario..."
                      className="mb-4"
                      value={state.commentText}
                      onChange={e => dispatch({ type: 'SET_COMMENT_TEXT', payload: e.target.value })}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tu calificación:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 cursor-pointer transition-colors ${
                                star <= state.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                              onClick={() => dispatch({ type: 'SET_RATING', payload: star })}
                            />
                          ))}
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!state.commentText || state.rating === 0}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Enviar comentario
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-6">
                    {state.comments.map((comment, index) => (
                      <div key={index} className="bg-white border rounded-lg p-6 hover:border-emerald-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {(comment.usuario || comment.name || "A").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{comment.usuario || comment.name}</h4>
                              <p className="text-sm text-gray-500">{comment.fecha || comment.date}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (comment.calificacion || comment.rating) 
                                    ? "text-yellow-400" 
                                    : "text-gray-300"
                                } fill-current`}
                              />
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
          </div>

          {/* Sidebar mejorado */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Progreso del curso</h3>
              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">Completado</span>
                  <span className="text-emerald-600 font-medium">{progreso}%</span>
                </div>
                <Progress 
                  value={progreso} 
                  className="h-2 bg-gray-100"
                />
              </div>
              <div className="space-y-4 mb-6">
                {curso.modulos?.map((mod: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_COMPLETADO', payload: idx })}
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        state.completados[idx]
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300 bg-white text-gray-300 hover:border-emerald-500"
                      }`}
                      aria-label={state.completados[idx] ? "Desmarcar módulo" : "Marcar como completado"}
                    >
                      {state.completados[idx] ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-3 w-3 rounded-full" />
                      )}
                    </button>
                    <span className="text-sm">{mod.titulo}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700" 
                disabled={progreso < 100}
              >
                Finalizar curso
              </Button>
              <Button 
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50" 
                variant="outline"
                onClick={() => dispatch({ type: 'RESET_PROGRESS', payload: (curso.modulos || []).length })}
              >
                Reiniciar progreso
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
