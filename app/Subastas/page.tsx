import AuctionCard from '@/components/custom/AuctionCard'
import React from 'react'
import type { Auction } from '@/lib/models/types'
import { timestampToDate } from '@/lib/models/types'

// Función helper para obtener la URL base
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
};

export default async function SubastasPage() {
  let subastas: Auction[] = [];
  let error: string | null = null;

  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/auctions`, {
      cache: 'no-store', // Siempre obtener datos frescos
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Error en respuesta API:', res.status, errorData);
      error = errorData.error || 'Error al obtener las subastas';
    } else {
      subastas = await res.json();
      console.log(`📦 Página recibió ${subastas?.length || 0} subastas`);
      if (subastas.length > 0) {
        console.log('Primera subasta:', subastas[0]);
      }
    }
  } catch (err) {
    console.error('❌ Error fetching subastas:', err);
    error = 'Error al conectar con el servidor';
  }

  return (
    <div className='max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-16 space-y-6'>
      <div className='flex items-center space-x-3'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-3 text-purple-900'>Subastas Activas</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {subastas.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">
          No hay subastas disponibles en este momento
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {subastas.map((subasta: Auction) => {
          // Calcular tiempo restante
          const endDate = timestampToDate(subasta.endDate);
          const now = new Date();
          const diff = endDate.getTime() - now.getTime();
          
          let endsIn = 'Finalizada';
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (days > 0) {
              endsIn = `${days}d ${hours}h`;
            } else {
              endsIn = `${hours}h`;
            }
          }

          return (
            <AuctionCard
              key={subasta.id}
              id={subasta.id}
              title={subasta.title}
              category={subasta.category}
              price={subasta.currentPrice || subasta.initialPrice}
              image={subasta.image}
              startDate={timestampToDate(subasta.startDate).toLocaleDateString()}
              endsIn={endsIn}
              currentBids={subasta.currentBids || 0}
            />
          );
        })}
      </div>
    </div>
  );
}
