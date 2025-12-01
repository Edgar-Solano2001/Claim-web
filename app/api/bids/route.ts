/** API para gestionar pujas */

import { NextRequest, NextResponse } from "next/server";
import {
  createBid,
  getBidsByAuction,
  getBidsByUser,
  getBidsByUserWithAuction,
  getHighestBid,
} from "@/lib/models/bids";
import type { BidCreateInput } from "@/lib/models/types";

// Obtener pujas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const auctionId = searchParams.get("auctionId");
    const userId = searchParams.get("userId");
    const highest = searchParams.get("highest") === "true";

    if (highest && auctionId) {
      // Obtener la puja más alta de una subasta
      const bid = await getHighestBid(auctionId);
      return NextResponse.json(bid);
    }

    if (auctionId) {
      // Obtener todas las pujas de una subasta
      const limit = searchParams.get("limit");
      const bids = await getBidsByAuction(
        auctionId,
        limit ? parseInt(limit) : undefined
      );
      return NextResponse.json(bids);
    }

    if (userId) {
      // Obtener todas las pujas de un usuario
      const limit = searchParams.get("limit");
      const withAuction = searchParams.get("withAuction") === "true";
      
      if (withAuction) {
        const bids = await getBidsByUserWithAuction(userId, limit ? parseInt(limit) : undefined);
        return NextResponse.json(bids);
      } else {
        const bids = await getBidsByUser(userId, limit ? parseInt(limit) : undefined);
        return NextResponse.json(bids);
      }
    }

    return NextResponse.json(
      { error: "Se requiere auctionId o userId" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error al obtener pujas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener las pujas" },
      { status: 500 }
    );
  }
}

// Crear una nueva puja
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bidData: BidCreateInput = {
      auctionId: body.auctionId,
      userId: body.userId,
      amount: parseFloat(body.amount),
    };

    // Validaciones básicas
    if (!bidData.auctionId || !bidData.userId || !bidData.amount) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: auctionId, userId, amount" },
        { status: 400 }
      );
    }

    if (bidData.amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor que 0" },
        { status: 400 }
      );
    }

    const bidId = await createBid(bidData);
    return NextResponse.json({ id: bidId, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear puja:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la puja" },
      { status: 400 }
    );
  }
}

