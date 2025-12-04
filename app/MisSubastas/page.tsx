"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuctionCard from "@/components/custom/AuctionCard";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import type { Auction } from "@/lib/models/types";
import { Badge } from "@/components/ui/badge";

// Función helper para obtener la URL base
const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
};

export default function MisSubastasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/Login");
      return;
    }

    fetchUserAuctions();
  }, [user, authLoading, router]);

  const fetchUserAuctions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(
        `${baseUrl}/api/auctions?sellerId=${user.uid}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Error al obtener tus subastas"
        );
      }

      const data = await res.json();
      setAuctions(data);
    } catch (err: unknown) {
      console.error("Error fetching user auctions:", err);
      if (err instanceof Error) {
        setError(err.message || "Error al cargar tus subastas.");
      } else {
        setError("Error al cargar tus subastas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-300 font-semibold">
            Activa
          </Badge>
        );
      case "ended":
        return (
          <Badge className="bg-gray-100 text-gray-700 border border-gray-300 font-semibold">
            Finalizada
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-300 font-semibold">
            Cancelada
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-300 font-semibold">
            {status}
          </Badge>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-purple-600">Cargando tus subastas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-16 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-2">
              Mis Subastas
            </h1>
            <p className="text-gray-600">
              Gestiona todas tus subastas creadas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/CrearSubasta" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Crear Subasta
              </Button>
            </Link>
            <Button
              onClick={fetchUserAuctions}
              variant="outline"
              className="flex items-center gap-2 text-purple-700 border-purple-200 hover:bg-purple-50 w-full sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {auctions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-purple-100 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total de Subastas</p>
              <p className="text-2xl font-bold text-purple-700">
                {auctions.length}
              </p>
            </div>
            <div className="bg-white border-2 border-green-100 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Subastas Activas</p>
              <p className="text-2xl font-bold text-green-700">
                {auctions.filter((a) => a.status === "active").length}
              </p>
            </div>
            <div className="bg-white border-2 border-gray-100 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Subastas Finalizadas</p>
              <p className="text-2xl font-bold text-gray-700">
                {auctions.filter((a) => a.status === "ended").length}
              </p>
            </div>
          </div>
        )}

        {/* Lista de subastas */}
        {auctions.length === 0 ? (
          <div className="bg-white border-2 border-purple-100 rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No tienes subastas aún
              </h2>
              <p className="text-gray-600 mb-6">
                Comienza a crear subastas y vende tus productos de manera
                competitiva.
              </p>
              <Link href="/CrearSubasta">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto">
                  <Plus className="h-5 w-5" />
                  Crear tu Primera Subasta
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filtros por estado (opcional, se puede expandir) */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">
                Filtrar por estado:
              </span>
              {["all", "active", "ended", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="text-purple-700 border-purple-200 hover:bg-purple-50"
                  onClick={() => {
                    // Aquí se puede implementar filtrado si se desea
                    console.log("Filtrar por:", status);
                  }}
                >
                  {status === "all"
                    ? "Todas"
                    : status === "active"
                    ? "Activas"
                    : status === "ended"
                    ? "Finalizadas"
                    : "Canceladas"}
                </Button>
              ))}
            </div>

            {/* Grid de subastas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {auctions.map((auction) => (
                <div key={auction.id} className="relative">
                  {/* Badge de estado sobre la tarjeta */}
                  <div className="absolute top-2 left-2 z-10">
                    {getStatusBadge(auction.status)}
                  </div>
                  <AuctionCard
                    id={auction.id}
                    title={auction.title}
                    category={auction.category}
                    price={auction.currentPrice}
                    image={auction.image}
                    startDate={
                      auction.startDate instanceof Date
                        ? auction.startDate.toISOString()
                        : typeof auction.startDate === "object" &&
                          "toDate" in auction.startDate
                        ? auction.startDate.toDate().toISOString()
                        : String(auction.startDate)
                    }
                    endsIn={auction.endsIn || "Finalizada"}
                    currentBids={auction.currentBids || 0}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
