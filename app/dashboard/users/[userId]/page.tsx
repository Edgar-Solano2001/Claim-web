"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setUser(null);
        } else {
          setUser(snap.data());
        }
      } catch (err) {
        console.error("Error obteniendo usuario:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <p className="text-white p-10">Cargando...</p>;
  }

  if (!user) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-10 text-white">
          <h1 className="text-2xl font-bold">Usuario no encontrado</h1>
          <p className="mt-4 text-gray-300">ID buscado: {userId}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Información del Usuario</h1>

        <div className="mt-6 bg-white/10 p-6 rounded-xl">

          {/* Mostrar foto SOLO si existe */}
          {user.photoURL && (
            <img
              src={user.photoURL}
              className="w-32 h-32 rounded-lg object-cover mb-4"
            />
          )}

          <p><strong>ID del Documento:</strong> {userId}</p>
          <p><strong>Nombre:</strong> {user.username || user.displayName}</p>
          <p><strong>Correo:</strong> {user.email}</p>
          <p><strong>Teléfono:</strong> {user.phone || "Sin teléfono"}</p>
          <p><strong>Estado:</strong> {user.isActive ? "Activo" : "Inactivo"}</p>
          <p><strong>Bids totales:</strong> {user.totalBids}</p>
        </div>
      </main>
    </div>
  );
}
