"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("register") ? "registro" : "login"
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="registro">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
                  <p className="text-gray-600 mt-1">Inicia sesión para continuar aprendiendo</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Correo electrónico</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login">Contraseña</Label>
                      <Link href="#" className="text-xs text-emerald-600 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password-login"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={async (e) => {
                      e.preventDefault();
                      setError("");
                      const res = await signIn("credentials", {
                        redirect: false,
                        email,
                        password,
                      });
                      if (res?.error) {
                        setError("Credenciales incorrectas");
                      } else {
                        router.push("/");
                      }
                    }}
                  >
                    Iniciar sesión
                  </Button>
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O continúa con</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full">
                    Google
                  </Button>
                  <Button className="w-full">
                    Microsoft
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="registro">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
                  <p className="text-gray-600 mt-1">Únete a nuestra comunidad de aprendizaje</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nombre</Label>
                      <Input id="first-name" placeholder="Juan" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Apellido</Label>
                      <Input id="last-name" placeholder="Pérez" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Correo electrónico</Label>
                    <Input id="email-register" type="email" placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Contraseña</Label>
                    <div className="relative">
                      <Input id="password-register" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 8 caracteres, incluyendo una letra mayúscula y un número
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-1"
                    />
                    <Label htmlFor="terms" className="font-normal text-sm">
                      Acepto los{" "}
                      <Link href="#" className="text-emerald-600 hover:underline">
                        Términos de servicio
                      </Link>{" "}
                      y la{" "}
                      <Link href="#" className="text-emerald-600 hover:underline">
                        Política de privacidad
                      </Link>
                    </Label>
                  </div>
                  <Button className="w-full">Crear cuenta</Button>
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O regístrate con</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full">
                    Google
                  </Button>
                  <Button className="w-full">
                    Microsoft
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
