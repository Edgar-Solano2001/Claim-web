"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { app } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // 🔥 FUNCIÓN PARA VERIFICAR ROL EN FIRESTORE
  const checkUserRole = async (uid: string) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data().role;
  };

  // 🔐 LOGIN CON EMAIL
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      const uid = result.user.uid;
      const role = await checkUserRole(uid);

      if (role === "admin") {
        router.push("/dashboard"); // 🔥 Redirección admin
      } else {
        router.push("/"); // Usuario normal
      }
    } catch (error: any) {
      console.error(error);
      alert("❌ Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 LOGIN CON GOOGLE
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const uid = result.user.uid;
      const role = await checkUserRole(uid);

      if (role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      alert("❌ Error al iniciar con Google: " + error.message);
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
              <label className="block text-sm font-medium text-purple-100">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-white/20 border-none text-white placeholder-purple-200 focus-visible:ring-2 focus-visible:ring-purple-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-100">
                Contraseña
              </label>
              <Input
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

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-purple-100">o</p>

            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-purple-700 font-semibold text-lg rounded-full py-6 hover:bg-purple-100 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continuar con Google
            </Button>
          </div>

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
    </div>
  );
}
