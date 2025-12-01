"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import BidCard from "@/components/custom/BidCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Bid } from "@/lib/models/types";

interface BidWithAuction extends Bid {
  auction?: {
    id: string;
    title: string;
    image: string;
    category: string;
    currentPrice: number;
    status: string;
    endDate: Date | any;
  };
}

export default function MisPujasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState<BidWithAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/Login");
      return;
    }

    fetchBids();
  }, [user, authLoading, router]);

  const fetchBids = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/bids?userId=${user.uid}&withAuction=true`);
      
      if (!response.ok) {
        throw new Error("Error al obtener las pujas");
      }

      const data = await response.json();
      setBids(data);
    } catch (err: any) {
      console.error("Error fetching bids:", err);
      setError(err.message || "Error al cargar las pujas");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando tus pujas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-16 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent">
              Mis Pujas
            </h1>
            <p className="text-gray-600 mt-2">
              Todas las subastas en las que has participado
            </p>
          </div>
          <Button
            onClick={fetchBids}
            variant="outline"
            className="hidden sm:flex"
          >
            🔄 Actualizar
          </Button>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {bids.length === 0 && !error && (
          <Card className="bg-white border-2 border-purple-100">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No has realizado ninguna puja aún
              </h3>
              <p className="text-gray-600 mb-6">
                Explora las subastas disponibles y comienza a pujar
              </p>
              <Button
                onClick={() => router.push("/Subastas")}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
              >
                Ver Subastas Activas
              </Button>
            </CardContent>
          </Card>
        )}

        {bids.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {bids.length} puja{bids.length !== 1 ? 's' : ''} encontrada{bids.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bids.map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

