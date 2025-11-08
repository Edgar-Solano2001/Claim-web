"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../lib/firebase"; // ← Aquí importas la configuración de Firebase
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const auth = getAuth(app);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Inicio de sesión exitoso");
      router.push("/"); // Redirige al inicio o donde desees
    } catch (error: any) {
      console.error(error);
      alert("❌ Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 animate-gradient">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl bg-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-bold text-white tracking-wider">
            INICIAR SESIÓN
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-purple-100"
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-white/20 border-none text-white placeholder-purple-200 focus-visible:ring-2 focus-visible:ring-purple-300"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-purple-100"
              >
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-white/20 border-none text-white placeholder-purple-200 focus-visible:ring-2 focus-visible:ring-purple-300"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-purple-700 font-semibold text-lg rounded-full py-6 hover:bg-purple-100 transition-all duration-200"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>

          <p className="text-center text-sm text-purple-100 mt-6">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              className="underline font-semibold hover:text-purple-200"
            >
              Regístrate
            </a>
          </p>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </div>
  );
}
