/** API para obtener y crear subastas */

import { NextRequest, NextResponse } from "next/server";
import { getActiveAuctions, getAllAuctions, createAuction } from "@/lib/models/auctions";
import type { AuctionCreateInput } from "@/lib/models/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");

    let auctions;

    // Si se solicita específicamente todas las subastas o un estado específico
    if (status) {
      auctions = await getAllAuctions(status);
    } else if (category) {
      // Obtener subastas por categoría
      const { getAuctionsByCategory } = await import("@/lib/models/auctions");
      auctions = await getAuctionsByCategory(category);
    } else if (sellerId) {
      // Obtener subastas por vendedor
      const { getAuctionsBySeller } = await import("@/lib/models/auctions");
      auctions = await getAuctionsBySeller(sellerId);
    } else {
      // Por defecto, obtener solo subastas activas
      const limitCount = limit ? parseInt(limit) : undefined;
      auctions = await getActiveAuctions(limitCount);
    }

    console.log(`API /api/auctions: Retornando ${auctions?.length || 0} subastas`);
    
    // Si no hay subastas, retornar array vacío en lugar de error
    return NextResponse.json(auctions || []);
  } catch (error: any) {
    console.error("Error al obtener las subastas:", error);
    console.error("Detalles del error:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
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
  } catch (error: any) {
    console.error("Error al crear subasta:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la subasta" },
      { status: 400 }
    );
  }
}