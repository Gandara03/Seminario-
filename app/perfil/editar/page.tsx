"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EditarPerfilPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !correo) {
      setMensaje("Completa todos los campos de perfil");
      return;
    }
    if (password && password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }
    setMensaje("Datos actualizados (simulado)");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Editar perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border">
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
        <div className="pt-2 border-t">
          <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
          <input
            type="password"
            className="border rounded w-full p-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Dejar en blanco para no cambiar"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
          <input
            type="password"
            className="border rounded w-full p-2"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Dejar en blanco para no cambiar"
          />
        </div>
        <Button type="submit" className="w-full">Guardar cambios</Button>
        {mensaje && <div className="text-center text-emerald-600 mt-2">{mensaje}</div>}
      </form>
    </div>
  );
} 