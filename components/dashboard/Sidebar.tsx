"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // App Router
import { auth } from "@/app/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Sidebar() {
  const router = useRouter();

  const [admin, setAdmin] = useState({
    name: "Administrador",
    email: "admin@claim.com",
    img: "https://i.pravatar.cc/100"
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdmin({
          name: user.displayName || "Administrador",
          email: user.email || "admin@claim.com",
          img: user.photoURL || "https://i.pravatar.cc/100"
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión en Firebase
      router.push("/Login"); // Redirige a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-purple-800 to-purple-700 text-white p-6">
      <div className="flex flex-col items-center">
        <img
          src={admin.img}
          className="rounded-full w-20 mb-2"
          alt="Foto del administrador"
        />
        <h3 className="text-lg font-bold">{admin.name}</h3>
        <p className="text-purple-200 text-sm">{admin.email}</p>
      </div>

      <nav className="mt-10 space-y-4">
        <Link href="/dashboard">
          <span className="block p-3 rounded hover:bg-purple-600 cursor-pointer">🏠 Inicio</span>
        </Link>

        <Link href="/dashboard/users">
          <span className="block p-3 rounded hover:bg-purple-600 cursor-pointer">👥 Usuarios</span>
        </Link>

        <Link href="/dashboard/subastas">
          <span className="block p-3 rounded hover:bg-purple-600 cursor-pointer">🛒 Subastas</span>
        </Link>

        <Link href="/dashboard/reportes">
          <span className="block p-3 rounded hover:bg-purple-600 cursor-pointer">📊 Reportes</span>
        </Link>

        {/* Botón de Salir */}
        <button
          onClick={handleLogout}
          className="w-full text-left block p-3 rounded hover:bg-purple-600 cursor-pointer"
        >
          ↩ Salir
        </button>
      </nav>
    </aside>
  );
}
