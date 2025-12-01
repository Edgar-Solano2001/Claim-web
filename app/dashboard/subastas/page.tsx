"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import AuctionCard from "@/components/dashboard/AuctionCard";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubastasPage() {
  const router = useRouter();

  const [auctions, setAuctions] = useState([
    { id: "1", title: "Figura Batman", price: "$500", img: "https://m.media-amazon.com/images/I/61e0H7o1tDL.jpg", status: "Activa" },
    { id: "2", title: "Carta YuGiOh", price: "$300", img: "https://i.ebayimg.com/images/g/AAkAAOSw7rtiGOUY/s-l1600.jpg", status: "Pendiente" },
    { id: "3", title: "Figura Iron Man", price: "$800", img: "https://i.ebayimg.com/images/g/ZZZZZZ/s-l1600.jpg", status: "Finalizada" },
  ]);

  const [requests, setRequests] = useState([
    { id: "4", title: "Subasta de Mario Kart", price: "$150", img: "https://i.ebayimg.com/images/g/YYYYYY/s-l1600.jpg" },
    { id: "5", title: "Subasta de Pokémon", price: "$200", img: "https://i.ebayimg.com/images/g/XXXXXa/s-l1600.jpg" },
  ]);

  const stats = {
    Activas: auctions.filter(a => a.status === "Activa").length,
    Pendientes: auctions.filter(a => a.status === "Pendiente").length,
    Finalizadas: auctions.filter(a => a.status === "Finalizada").length,
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold">Gestión de Subastas</h1>

        {/* Stats */}
        <div className="flex gap-5 mt-6">
          <StatsCard icon="🟢" number={stats.Activas} label="Subastas Activas" />
          <StatsCard icon="🟡" number={stats.Pendientes} label="Subastas Pendientes" />
          <StatsCard icon="🔴" number={stats.Finalizadas} label="Subastas Finalizadas" />
        </div>

        {/* Listado de Subastas */}
        <h2 className="text-2xl font-bold mt-10">Listado de Subastas</h2>
        <div className="grid grid-cols-3 gap-6 mt-5">
          {auctions.map((a) => (
            <AuctionCard
              key={a.id}
              img={a.img}
              title={a.title}
              price={a.price}
              status={a.status as "Activa" | "Pendiente" | "Finalizada"}
              onClick={() => router.push(`/dashboard/subastas/${a.id}`)} // redirige al detalle
            />
          ))}
        </div>

        {/* Solicitudes de Subastas */}
        <h2 className="text-2xl font-bold mt-10">Solicitudes de Subastas</h2>
        <div className="grid grid-cols-3 gap-6 mt-5">
          {requests.map((r) => (
            <AuctionCard
              key={r.id}
              img={r.img}
              title={r.title}
              price={r.price}
              status="Pendiente"
              onClick={() => router.push(`/dashboard/subastas/${r.id}`)} // redirige al detalle
            />
          ))}
        </div>
      </main>
    </div>
  );
}
