"use client";

import { useEffect, useState } from "react";
import { timestampToDate, type Auction } from "@/lib/models/types";
import AuctionCard from "./AuctionCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedAuctions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/auctions?featured=true&limit=4", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Error al obtener productos destacados");
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener productos destacados:", err);
        setError("No se pudieron cargar los productos destacados");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAuctions();
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-purple-900 mb-5">Productos destacados</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-gray-600">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay productos destacados disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mx-auto">
          {products.map((product) => (
            <AuctionCard key={product.id}
            id={product.id}
            title={product.title}
            category={product.category}
            price={product.currentPrice || product.initialPrice}
            image={product.image}
            startDate={timestampToDate(product.startDate).toLocaleDateString()}
            endsIn={product.endsIn?.toString() ?? ""}
            currentBids={product.currentBids || 0}/>
        ))}
      </div>    
    )}
  </section>
);
}