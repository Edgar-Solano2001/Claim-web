"use client";

import { useAuth } from "@/context/AuthContext";
import BidModal from "./BidModal";
import { Card, CardContent } from "@/components/ui/card";

interface BidSectionProps {
  auctionId: string;
  currentPrice: number;
  minimumBid: number;
  sellerId: string;
  isActive: boolean;
}

export default function BidSection({
  auctionId,
  currentPrice,
  minimumBid,
  sellerId,
  isActive,
}: BidSectionProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === sellerId;

  if (!isActive) {
    return (
      <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-600 text-center font-medium">
          Esta subasta ha finalizado
        </p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700 text-center font-medium">
          Esta es tu subasta. No puedes pujar en tus propias subastas.
        </p>
      </div>
    );
  }

  return (
    <BidModal
      auctionId={auctionId}
      currentPrice={currentPrice}
      minimumBid={minimumBid}
      sellerId={sellerId}
    />
  );
}

