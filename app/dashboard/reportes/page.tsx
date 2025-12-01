"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ReportesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // ⭐ 1. Usuarios
        const usersSnap = await getDocs(collection(db, "users"));
        setUsuariosRegistrados(usersSnap.size);

        // ⭐ 2. Solicitudes (colección auctions)
        const auctionsSnap = await getDocs(collection(db, "auctions"));

        const auctionsData = auctionsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSolicitudes(auctionsData);
      } catch (error) {
        console.error("Error cargando reportes:", error);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Contadores dinámicos
  const stats = {
    Activas: solicitudes.filter((s) => s.status === "active").length,
    Pendientes: solicitudes.filter((s) => s.status === "review").length,
    Finalizadas: solicitudes.filter((s) => s.status === "finished").length,
    Usuarios: usuariosRegistrados,
  };

  const loadingOrValue = (val: number) => (isLoading ? "..." : val);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold">Reportes del Sistema</h1>

        {/* Stats */}
        <div className="flex gap-5 mt-6">
          <StatsCard icon="🟢" number={loadingOrValue(stats.Activas)} label="Solicitudes Activas" />
          <StatsCard icon="🟡" number={loadingOrValue(stats.Pendientes)} label="Solicitudes Pendientes" />
          <StatsCard icon="🔴" number={loadingOrValue(stats.Finalizadas)} label="Solicitudes Finalizadas" />
          <StatsCard icon="👥" number={loadingOrValue(stats.Usuarios)} label="Usuarios Registrados" />
        </div>

        {/* Listado */}
        <h2 className="text-2xl font-bold mt-10">Listado de Solicitudes</h2>

        <div className="grid grid-cols-3 gap-6 mt-5">
          {solicitudes.map((s) => (
            <div key={s.id} className="bg-white/10 p-4 rounded-xl text-white">
              <h4 className="font-bold">{s.title || "Sin título"}</h4>

              <p className="mt-2 text-sm text-gray-300">
                Estado:{" "}
                <span className="capitalize">
                  {s.status || "sin status"}
                </span>
              </p>

              <p className="mt-1 text-xs text-gray-400">
                ID: {s.id}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
