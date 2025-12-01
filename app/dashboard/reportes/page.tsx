"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { useState } from "react";

export default function ReportesPage() {
  // Datos simulados
  const [solicitudes, setSolicitudes] = useState([
    { id: 1, title: "Solicitud 1", status: "Activa" },
    { id: 2, title: "Solicitud 2", status: "Pendiente" },
    { id: 3, title: "Solicitud 3", status: "Finalizada" },
    { id: 4, title: "Solicitud 4", status: "Activa" },
  ]);

  const [usuariosRegistrados, setUsuariosRegistrados] = useState(35);

  const stats = {
    Activas: solicitudes.filter(s => s.status === "Activa").length,
    Pendientes: solicitudes.filter(s => s.status === "Pendiente").length,
    Finalizadas: solicitudes.filter(s => s.status === "Finalizada").length,
    Usuarios: usuariosRegistrados,
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold">Reportes del Sistema</h1>

        {/* Stats */}
        <div className="flex gap-5 mt-6">
          <StatsCard icon="🟢" number={stats.Activas} label="Solicitudes Activas" />
          <StatsCard icon="🟡" number={stats.Pendientes} label="Solicitudes Pendientes" />
          <StatsCard icon="🔴" number={stats.Finalizadas} label="Solicitudes Finalizadas" />
          <StatsCard icon="👥" number={stats.Usuarios} label="Usuarios Registrados" />
        </div>

        {/* Listado de Solicitudes */}
        <h2 className="text-2xl font-bold mt-10">Listado de Solicitudes</h2>
        <div className="grid grid-cols-3 gap-6 mt-5">
          {solicitudes.map((s) => (
            <div key={s.id} className="bg-white/10 p-4 rounded-xl text-white">
              <h4 className="font-bold">{s.title}</h4>
              <p className="mt-2 text-sm text-gray-300">Estado: {s.status}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
