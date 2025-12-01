/** API para obtener una subasta específica */

import { NextRequest, NextResponse } from "next/server";
import { getAuction, getAuctionWithBids } from "@/lib/models/auctions";

/**
 * API para obtener una subasta específica
 * @param request - La solicitud HTTP
 * @param params - Los parámetros de la solicitud
 * @returns La subasta encontrada o un error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auctionId = id;
    const searchParams = request.nextUrl.searchParams;
    const withBids = searchParams.get("withBids") === "true";

    if (withBids) {
      const includeUserInfo = searchParams.get("includeUsers") === "true";
      const auction = await getAuctionWithBids(auctionId, includeUserInfo);
      if (!auction) {
        return NextResponse.json(
          { error: "Subasta no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(auction);
    }

    const auction = await getAuction(auctionId);
    if (!auction) {
      return NextResponse.json(
        { error: "Subasta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(auction);
  } catch (error: any) {
    console.error("Error al obtener subasta:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener la subasta" },
      { status: 500 }
    );
  }
}

