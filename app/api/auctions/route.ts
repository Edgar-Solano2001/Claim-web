/** API para obtener y crear subastas */

import { NextRequest, NextResponse } from "next/server";
import { getActiveAuctions, getAllAuctions, createAuction, getFeaturedAuctions } from "@/lib/models/auctions";
import type { AuctionCreateInput, AuctionStatus } from "@/lib/models/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");

    let auctions;

    // Si se solicitan productos destacados
    if (featured === "true") {
      const limitCount = limit ? parseInt(limit) : 4;
      auctions = await getFeaturedAuctions(limitCount);
    } else if (status) {
      // Si se solicita específicamente todas las subastas o un estado específico
      auctions = await getAllAuctions(status as AuctionStatus);
    } else if (category) {
      // Obtener subastas por categoría
      const { getAuctionsByCategory } = await import("@/lib/models/auctions");
      auctions = await getAuctionsByCategory(category);
    } else if (sellerId) {
      // Obtener subastas por vendedor
      const { getAuctionsBySeller } = await import("@/lib/models/auctions");
      try {
        auctions = await getAuctionsBySeller(sellerId);
        console.log(`✅ API /api/auctions?sellerId=${sellerId}: Retornando ${auctions?.length || 0} subastas`);
      } catch (error) {
        console.error(`❌ Error al obtener subastas del vendedor ${sellerId}:`, error);
        auctions = [];
      }
    } else {
      // Por defecto, obtener solo subastas activas
      const limitCount = limit ? parseInt(limit) : undefined;
      auctions = await getActiveAuctions(limitCount);
    }

    console.log(`API /api/auctions: Retornando ${auctions?.length || 0} subastas`);
    
    // Si no hay subastas, retornar array vacío en lugar de error
    return NextResponse.json(auctions || []);
  } catch (error: unknown) {
    console.error("Error al obtener las subastas:", error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
    } : {};
    const firebaseError = error as { code?: string };
    console.error("Detalles del error:", {
      code: firebaseError.code,
      ...errorDetails,
    });
    
    // Retornar array vacío en lugar de error para que la página no falle
    return NextResponse.json([]);
  }
}

// Crear una nueva subasta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validaciones básicas
    if (!body.title || !body.category || !body.sellerId || !body.initialPrice) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: title, category, sellerId, initialPrice" },
        { status: 400 }
      );
    }

    if (typeof body.initialPrice !== "number" || body.initialPrice <= 0) {
      return NextResponse.json(
        { error: "El precio inicial debe ser mayor que 0" },
        { status: 400 }
      );
    }

    if (!body.image || !body.image.trim()) {
      return NextResponse.json(
        { error: "Debes proporcionar al menos una imagen" },
        { status: 400 }
      );
    }

    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "Debes proporcionar fecha de inicio y fin" },
        { status: 400 }
      );
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Fechas inválidas" },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }

    const auctionData: AuctionCreateInput = {
      title: body.title.trim(),
      description: body.description?.trim() || "",
      category: body.category.trim(),
      sellerId: body.sellerId.trim(),
      initialPrice: parseFloat(body.initialPrice),
      reservePrice: body.reservePrice ? parseFloat(body.reservePrice) : undefined,
      image: body.image.trim(),
      images: body.images && Array.isArray(body.images) ? body.images : undefined,
      location: body.location?.trim() || undefined,
      startDate: startDate,
      endDate: endDate,
    };

    const auctionId = await createAuction(auctionData);
    return NextResponse.json({ id: auctionId, success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear subasta:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al crear la subasta";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}