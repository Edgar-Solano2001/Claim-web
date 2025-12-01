"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface BidModalProps {
  auctionId: string;
  currentPrice: number;
  minimumBid?: number;
  trigger?: React.ReactNode;
}

export default function BidModal({
  auctionId,
  currentPrice,
  minimumBid,
  trigger,
}: BidModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const minBid = minimumBid || currentPrice + 1;
  const suggestedBids = [
    minBid,
    Math.ceil(minBid * 1.1),
    Math.ceil(minBid * 1.25),
    Math.ceil(minBid * 1.5),
  ];

  const handleBid = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para hacer una puja");
      setOpen(false);
      setTimeout(() => {
        router.push("/Login");
      }, 500);
      return;
    }

    const bidAmount = parseFloat(amount);
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (bidAmount < minBid) {
      toast.error(`La puja debe ser al menos $${minBid.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionId,
          userId: user.uid,
          amount: bidAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la puja");
      }

      toast.success(`¡Puja de $${bidAmount.toFixed(2)} realizada exitosamente!`);
      setOpen(false);
      setAmount("");
      
      // Esperar un momento antes de recargar para que el usuario vea el mensaje
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Error al hacer puja:", error);
      toast.error(error.message || "Error al realizar la puja");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBid = (quickAmount: number) => {
    setAmount(quickAmount.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <span className="mr-2">💰</span>
            Hacer una Puja
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-900">
            Realizar una Puja
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Ingresa el monto que deseas ofertar. Debe ser mayor que la oferta actual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información de la oferta actual */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Oferta actual:
              </span>
              <span className="text-xl font-bold text-purple-700">
                ${currentPrice.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-600">
                Puja mínima:
              </span>
              <span className="text-lg font-semibold text-purple-600">
                ${minBid.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Input de monto */}
          <div className="space-y-2">
            <label
              htmlFor="bid-amount"
              className="text-sm font-medium text-gray-700"
            >
              Tu oferta
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <input
                id="bid-amount"
                type="number"
                step="0.01"
                min={minBid}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Mínimo $${minBid.toFixed(2)}`}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-lg font-semibold"
                disabled={loading}
              />
            </div>
          </div>

          {/* Botones rápidos */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ofertas rápidas:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {suggestedBids.map((quickAmount, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickBid(quickAmount)}
                  className="px-4 py-2 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-sm font-medium text-purple-700"
                  disabled={loading}
                >
                  ${quickAmount.toLocaleString("es-ES", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de confirmación */}
          <Button
            onClick={handleBid}
            disabled={loading || !amount || parseFloat(amount) < minBid}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="mr-2">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                <span className="mr-2">💰</span>
                Confirmar Puja
              </>
            )}
          </Button>

          {!user && (
            <p className="text-sm text-center text-gray-500">
              <a href="/Login" className="text-purple-600 hover:underline">
                Inicia sesión
              </a>{" "}
              para hacer una puja
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

