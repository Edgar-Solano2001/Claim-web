"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import AuctionCard from "@/components/dashboard/AuctionCard";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// Interface para subastas reales
interface AuctionData {
  id: string;
  title: string;
  currentPrice: number;
  imageUrl: string;
  status: "active" | "pending" | "finished";
}

export default function SubastasPage() {
  const router = useRouter();

  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "auctions"));

        const auctionList: AuctionData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;

          auctionList.push({
            id: doc.id,
            title: data.title || "Sin título",
            currentPrice: data.currentPrice || 0,
            imageUrl: data.imageUrl || "https://via.placeholder.com/300",
            status: data.status || "pending",
          });
        });

        setAuctions(auctionList);
      } catch (error) {
        console.error("Error loading auctions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuctions();
  }, []);

  // Estadísticas reales
  const stats = {
    Activas: auctions.filter(a => a.status === "active").length,
    Pendientes: auctions.filter(a => a.status === "pending").length,
    Finalizadas: auctions.filter(a => a.status === "finished").length,
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

        {isLoading ? (
          <p className="text-gray-300 mt-5">Cargando subastas...</p>
        ) : (
          <div className="grid grid-cols-3 gap-6 mt-5">
            {auctions.map((a) => (
              <AuctionCard
                key={a.id}
                img={a.imageUrl}
                title={a.title}
                price={`$${a.currentPrice}`}
                status={
                  a.status === "active"
                    ? "Activa"
                    : a.status === "pending"
                    ? "Pendiente"
                    : "Finalizada"
                }
                onClick={() => router.push(`/dashboard/subastas/${a.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
