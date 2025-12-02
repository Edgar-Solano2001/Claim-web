import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { timestampToDate, type Bid, type BidWithUser, type AuctionWithBids, type User } from "@/lib/models/types";
import { getCategoryName } from "@/lib/models/categories";
import { getUser } from "@/lib/models/users";
import ProductsGallery from "@/components/custom/ProductsGallery";
import BidSection from "@/components/custom/BidSection";
import UserAvatar from "@/components/custom/UserAvatar";

// Función helper para obtener la URL base
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubastaDetalle({ params }: PageProps) {
  const { id } = await params;
  const auctionId = id;

  let auction: AuctionWithBids | null = null;
  let bids: BidWithUser[] = [];
  let categoryName = "";
  let seller: User | null = null;
  let error: string | null = null;

  try {
    const baseUrl = getBaseUrl();
    // Llamar a la API con withBids=true e includeUsers=true para obtener también las pujas con información del usuario
    const res = await fetch(`${baseUrl}/api/auctions/${auctionId}?withBids=true&includeUsers=true`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      error = errorData.error || "Subasta no encontrada";
    } else {
      auction = await res.json();
      
      if (!auction) {
        error = "Subasta no encontrada";
      } else {
        bids = auction.bids || [];
        // Obtener el nombre de la categoría
        try {
          categoryName = await getCategoryName(auction.category);
        } catch (err) {
          categoryName = auction.category; // Usar el ID si no se puede obtener el nombre
        }
        
        // Obtener información del vendedor
        try {
          seller = await getUser(auction.sellerId);
        } catch (err) {
          console.error("Error obteniendo información del vendedor:", err);
          seller = null;
        }
      }
    }
  } catch (err: unknown) {
    console.error("Error loading auction:", err);
    error = (err as Error).message || "Error al cargar la subasta";
  }

  if (error || !auction) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error || "Subasta no encontrada"}
        </div>
      </div>
    );
  }

  const startDate = timestampToDate(auction.startDate);
  const endDate = timestampToDate(auction.endDate);
  const now = new Date();
  const isActive = auction.status === "active" && endDate > now;
  const isEnded = auction.status === "ended" || endDate <= now;
  
  // Calcular tiempo restante
  const diff = endDate.getTime() - now.getTime();
  let timeRemaining = "Finalizada";
  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      timeRemaining = `${days}d ${hours}h`;
    } else if (hours > 0) {
      timeRemaining = `${hours}h ${minutes}m`;
    } else {
      timeRemaining = `${minutes}m`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-16 space-y-8">
        {/* Header con breadcrumb y estado */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold px-4 py-1.5 shadow-md">
                {categoryName || auction.category}
              </Badge>
              {isActive && (
                <Badge 
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-2 border-green-300 font-semibold px-4 py-1.5 animate-pulse"
                >
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Activa
                </Badge>
              )}
              {isEnded && (
                <Badge 
                  variant="outline" 
                  className="bg-gray-100 text-gray-700 border-2 border-gray-300 font-semibold px-4 py-1.5"
                >
                  Finalizada
                </Badge>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent leading-tight">
              {auction.title}
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">
              {auction.description}
            </p>
          </div>
        </div>

        {/* Contenido principal: Galería y detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galería de imágenes */}
          <div className="lg:col-span-2">
            <ProductsGallery 
              mainImage={auction.image}
              images={auction.images}
              title={auction.title}
            />
          </div>

          {/* Panel de información de la subasta */}
          <div className="space-y-6">
            <Card className="bg-white border-2 border-purple-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white pb-4">
                <h2 className="text-2xl font-bold">Información de la Subasta</h2>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Precio inicial */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Precio Inicial</p>
                  <p className="text-3xl font-bold text-purple-700">
                    ${auction.initialPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {/* Oferta actual */}
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Oferta Actual</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                      ${auction.currentPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Número de pujas */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg mb-4">
                    <span className="text-sm font-medium text-gray-600">Pujas realizadas</span>
                    <span className="text-xl font-bold text-purple-700">{bids.length}</span>
                  </div>
                </div>

                {/* Tiempo restante */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Tiempo Restante</p>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className={`text-3xl font-bold font-mono ${timeRemaining === "Finalizada" ? "text-gray-500" : "text-purple-700"}`}>
                      {timeRemaining === "Finalizada" ? "Finalizada" : timeRemaining}
                    </p>
                    {timeRemaining !== "Finalizada" && (
                      <p className="text-xs text-gray-500 mt-1">restante</p>
                    )}
                  </div>
                </div>

                {/* Sección de puja */}
                <BidSection
                  auctionId={auction.id}
                  currentPrice={auction.currentPrice}
                  minimumBid={auction.currentPrice + 1}
                  sellerId={auction.sellerId}
                  isActive={isActive}
                />
              </CardContent>
            </Card>

            {/* Información del vendedor */}
            {seller && (
              <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
                <CardHeader>
                  <h3 className="font-semibold text-gray-800">Vendedor</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      photoURL={seller.photoURL}
                      displayName={seller.displayName}
                      username={seller.username}
                      size={64}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 truncate">
                        {seller.displayName || seller.username || 'Usuario'}
                      </h4>
                      {seller.username && seller.username !== seller.displayName && (
                        <p className="text-sm text-gray-500 truncate">@{seller.username}</p>
                      )}
                      
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detalles adicionales */}
            <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
              <CardHeader>
                <h3 className="font-semibold text-gray-800">Detalles</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Fecha de inicio</span>
                  <span className="font-medium text-gray-800">
                    {startDate.toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Fecha de finalización</span>
                  <span className="font-medium text-gray-800">
                    {endDate.toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mensaje de ganador cuando la subasta terminó */}
        {isEnded && bids.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏆</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-800 mb-1">
                    Subasta Finalizada
                  </h3>
                  <p className="text-green-700">
                    {bids[0]?.user?.displayName || bids[0]?.user?.username || 'Usuario desconocido'} ganó esta subasta con una puja de{" "}
                    <span className="font-bold">
                      ${bids[0]?.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de pujas */}
        {bids.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50/50 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Historial de Pujas</h2>
              <p className="text-sm text-gray-500 mt-1">Últimas {Math.min(bids.length, 10)} pujas realizadas</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {bids.slice(0, 10).map((bid, idx) => {
                  // Determinar si es la puja ganadora: solo si la subasta terminó y es la puja con mayor valor (primera en la lista)
                  // Las pujas ya vienen ordenadas por monto descendente, así que la primera (idx === 0) es la de mayor valor
                  const isHighestBid = idx === 0 && bids.length > 0;
                  // Solo mostrar como ganadora si la subasta terminó y es la puja más alta
                  const isWinning = isEnded && isHighestBid;
                  
                  return (
                  <div
                    key={bid.id}
                    className={`p-4 hover:bg-purple-50/50 transition-colors ${
                      isWinning ? 'bg-green-50/50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                          isWinning 
                            ? 'bg-green-500 text-white' 
                            : idx === 0 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          #{bids.length - idx}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <UserAvatar
                            photoURL={bid.user?.photoURL}
                            displayName={bid.user?.displayName}
                            username={bid.user?.username}
                            size={40}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg text-gray-900">
                              ${bid.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {bid.user?.displayName || bid.user?.username || 'Usuario desconocido'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {timestampToDate(bid.timestamp).toLocaleString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      {isWinning && (
                        <Badge className="bg-green-100 text-green-700 border border-green-300 font-semibold ml-4">
                          🏆 Ganadora
                        </Badge>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {bids.length === 0 && isActive && (
          <Card className="bg-yellow-50 border border-yellow-200 rounded-xl">
            <CardContent className="p-6 text-center">
              <p className="text-yellow-800 font-medium">
                ⚡ Sé el primero en hacer una puja en esta subasta
              </p>
            </CardContent>
          </Card>
        )}

        {bids.length === 0 && isEnded && (
          <Card className="bg-gray-50 border border-gray-200 rounded-xl">
            <CardContent className="p-6 text-center">
              <p className="text-gray-700 font-medium">
                Esta subasta finalizó sin pujas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}