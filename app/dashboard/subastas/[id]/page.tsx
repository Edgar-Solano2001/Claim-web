"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuctionData {
  title: string;
  description: string;
  category: string;
  initialPrice: number;
  currentPrice?: number;
  image?: string;
  images?: string[];
  sellerId: string;
  startDate: { seconds: number };
  endDate: { seconds: number };
  status: string;
}

export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const auctionId = params.id;

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);

  /** 🔥 Cargar los datos reales desde Firestore */
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const ref = doc(db, "auctions", auctionId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setAuction(snap.data() as AuctionData);
        } else {
          console.error("Subasta no encontrada");
        }
      } catch (error) {
        console.error("Error cargando subasta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId]);

  if (loading) return <div className="text-white p-10">Cargando...</div>;
  if (!auction) return <div className="text-white p-10">No se encontró esta subasta.</div>;

  /** Convertir Fechas Firebase */
  const formatDate = (ts?: { seconds: number }) =>
    ts ? new Date(ts.seconds * 1000).toLocaleString() : "N/A";

  /** Imagen principal */
  const mainImage =
    auction.image ||
    (auction.images && auction.images.length > 0 ? auction.images[0] : "/no-image.png");

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-[#15203a] text-white p-10">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-purple-700 rounded hover:bg-purple-800"
        >
          ← Volver
        </button>

        <h1 className="text-3xl font-bold mb-6">Detalle de Subasta</h1>

        {/* CARD PRINCIPAL */}
        <div className="bg-white/10 p-6 rounded-xl mb-8 flex gap-6">
          <img src={mainImage} className="w-64 h-64 object-cover rounded" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{auction.title}</h2>
            <p className="text-gray-300 mb-2">{auction.description}</p>

            <p className="text-gray-400 mb-1">
              <strong>Categoría:</strong> {auction.category}
            </p>

            <p className="text-gray-400 mb-1">
              <strong>Precio inicial:</strong> ${auction.initialPrice}
            </p>

            <p className="text-gray-400 mb-1">
              <strong>Precio actual:</strong>{" "}
              {auction.currentPrice ? `$${auction.currentPrice}` : "Sin pujas"}
            </p>

            <p className="text-gray-400">
              <strong>Status:</strong> {auction.status}
            </p>
          </div>
        </div>

        {/* SELLER INFO (puedes expandirlo después si quieres traer info del usuario) */}
        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-bold mb-2">Vendedor</h3>
          <p className="text-gray-300">
            <strong>ID del vendedor:</strong> {auction.sellerId}
          </p>
        </div>

        {/* DETALLES DE FECHAS */}
        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-bold mb-3">Detalles de la Subasta</h3>

          <p className="text-gray-400 mb-1">
            <strong>Fecha de inicio:</strong> {formatDate(auction.startDate)}
          </p>

          <p className="text-gray-400 mb-1">
            <strong>Fecha de fin:</strong> {formatDate(auction.endDate)}
          </p>
        </div>

        {/* BOTONES */}
        <div className="flex gap-4">
          <button className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-bold transition">
            Aprobar Publicación
          </button>

          <button className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded font-bold transition">
            Negar Publicación
          </button>
        </div>
      </main>
    </div>
  );
}
