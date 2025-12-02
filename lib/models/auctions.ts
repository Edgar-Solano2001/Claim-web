/** Funciones CRUD para subastas */

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type {
  Auction,
  AuctionCreateInput,
  AuctionUpdateInput,
  AuctionStatus,
  AuctionWithBids,
} from "./types";
import { calculateTimeRemaining, timestampToDate } from "./types";

// ============================================================================
// CREAR SUBASTA
// ============================================================================

/**
 * Crea una nueva subasta
 * @param auctionData Datos de la subasta a crear
 * @returns ID de la subasta creada
 */
export async function createAuction(
  auctionData: AuctionCreateInput
): Promise<string> {
  const auctionsRef = collection(db, "auctions");

  // Convertir Date a Timestamp si es necesario
  const convertToTimestamp = (date: Date | Timestamp): Timestamp => {
    if (date instanceof Date) {
      return Timestamp.fromDate(date);
    }
    if (date instanceof Timestamp) {
      return date;
    }
    // Fallback: crear timestamp desde ahora
    return Timestamp.now();
  };

  // Validar campos requeridos
  if (!auctionData.title || !auctionData.category || !auctionData.sellerId) {
    throw new Error("Faltan campos requeridos: title, category, sellerId");
  }

  if (typeof auctionData.initialPrice !== "number" || auctionData.initialPrice <= 0) {
    throw new Error("initialPrice debe ser un número mayor que 0");
  }

  const auction: Record<string, any> = {
    title: String(auctionData.title).trim(),
    description: String(auctionData.description || "").trim(),
    category: String(auctionData.category).trim(),
    sellerId: String(auctionData.sellerId).trim(),
    initialPrice: Number(auctionData.initialPrice),
    currentPrice: Number(auctionData.initialPrice),
    image: String(auctionData.image || "").trim(),
    status: "active",
    startDate: convertToTimestamp(auctionData.startDate),
    endDate: convertToTimestamp(auctionData.endDate),
    currentBids: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Agregar images solo si hay elementos
  if (auctionData.images && Array.isArray(auctionData.images) && auctionData.images.length > 0) {
    auction.images = auctionData.images.filter((img) => img && String(img).trim() !== "");
  }

  // Solo agregar campos opcionales si están definidos y son válidos
  if (auctionData.reservePrice !== undefined && auctionData.reservePrice !== null) {
    const reservePrice = Number(auctionData.reservePrice);
    if (!isNaN(reservePrice) && reservePrice > 0) {
      auction.reservePrice = reservePrice;
    }
  }
  
  if (auctionData.location && typeof auctionData.location === "string" && auctionData.location.trim() !== "") {
    auction.location = auctionData.location.trim();
  }

  // Agregar isFeatured si está definido
  if (auctionData.isFeatured !== undefined) {
    auction.isFeatured = Boolean(auctionData.isFeatured);
  }

  const docRef = await addDoc(auctionsRef, auction);
  return docRef.id;
}

// ============================================================================
// OBTENER SUBASTA
// ============================================================================

/**
 * Obtiene una subasta por su ID
 * @param auctionId ID de la subasta
 * @returns Subasta o null si no existe
 */
export async function getAuction(auctionId: string): Promise<Auction | null> {
  const auctionRef = doc(db, "auctions", auctionId);
  const auctionSnap = await getDoc(auctionRef);

  if (!auctionSnap.exists()) {
    return null;
  }

  const data = auctionSnap.data();
  const auction: Auction = {
    id: auctionSnap.id,
    ...data,
    endsIn: calculateTimeRemaining(data.endDate),
  } as Auction;

  return auction;
}

/**
 * Obtiene una subasta con sus pujas
 * @param auctionId ID de la subasta
 * @returns Subasta con pujas o null si no existe
 */
export async function getAuctionWithBids(
  auctionId: string,
  includeUserInfo: boolean = false
): Promise<AuctionWithBids | null> {
  const auction = await getAuction(auctionId);
  if (!auction) return null;

  // Obtener pujas de la subasta
  if (includeUserInfo) {
    const { getBidsByAuctionWithUsers } = await import("./bids");
    const bids = await getBidsByAuctionWithUsers(auctionId);
    return {
      ...auction,
      bids,
      highestBid: bids.length > 0 ? bids[0] : undefined,
    };
  } else {
    const { getBidsByAuction } = await import("./bids");
    const bids = await getBidsByAuction(auctionId);
    return {
      ...auction,
      bids,
      highestBid: bids.length > 0 ? bids[0] : undefined,
    };
  }
}

/**
 * Obtiene todas las subastas activas
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de subastas activas
 */
export async function getActiveAuctions(
  limitCount?: number
): Promise<Auction[]> {
  try {
    const auctionsRef = collection(db, "auctions");
    
    // Intentar consulta con índice compuesto primero
    try {
      const constraints: QueryConstraint[] = [
        where("status", "==", "active"),
        orderBy("endDate", "asc"),
      ];

      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(auctionsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const auctions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Asegurar que todos los campos requeridos existan
        const auction: Partial<Auction> & { id: string } = {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "sin-categoria", // Valor por defecto si falta
          sellerId: data.sellerId || "",
          initialPrice: data.initialPrice || 0,
          currentPrice: data.currentPrice || data.initialPrice || 0,
          image: data.image || "",
          images: data.images || [],
          status: data.status || "active",
          startDate: data.startDate,
          endDate: data.endDate,
          currentBids: data.currentBids || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        
        // Campos opcionales
        if (data.reservePrice !== undefined) auction.reservePrice = data.reservePrice;
        if (data.currentBidId) auction.currentBidId = data.currentBidId;
        if (data.location) auction.location = data.location;
        
        auction.endsIn = calculateTimeRemaining(data.endDate);
        return auction as Auction;
      });
      
      console.log(`✅ getActiveAuctions: Encontradas ${auctions.length} subastas activas`);
      return auctions;
    } catch (error: unknown) {
      // Si falla por falta de índice, intentar sin orderBy
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "failed-precondition" || firebaseError.message?.includes("index")) {
        console.warn("Índice compuesto no encontrado, usando consulta simple");
        const constraints: QueryConstraint[] = [
          where("status", "==", "active"),
        ];

        if (limitCount) {
          constraints.push(limit(limitCount));
        }

        const q = query(auctionsRef, ...constraints);
        const querySnapshot = await getDocs(q);

        // Ordenar manualmente en memoria
        const auctions = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Asegurar que todos los campos requeridos existan
          const auction: Partial<Auction> & { id: string } = {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            category: data.category || "sin-categoria", // Valor por defecto si falta
            sellerId: data.sellerId || "",
            initialPrice: data.initialPrice || 0,
            currentPrice: data.currentPrice || data.initialPrice || 0,
            image: data.image || "",
            images: data.images || [],
            status: data.status || "active",
            startDate: data.startDate,
            endDate: data.endDate,
            currentBids: data.currentBids || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
          
          // Campos opcionales
          if (data.reservePrice !== undefined) auction.reservePrice = data.reservePrice;
          if (data.currentBidId) auction.currentBidId = data.currentBidId;
          if (data.location) auction.location = data.location;
          
          auction.endsIn = calculateTimeRemaining(data.endDate);
          return auction as Auction;
        });

        // Ordenar por endDate manualmente
        return auctions.sort((a, b) => {
          const dateA = timestampToDate(a.endDate).getTime();
          const dateB = timestampToDate(b.endDate).getTime();
          return dateA - dateB;
        });
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error("Error en getActiveAuctions:", error);
    // Retornar array vacío en lugar de lanzar error
    return [];
  }
}

/**
 * Obtiene subastas destacadas (isFeatured === true)
 * @param limitCount Límite de resultados (opcional, por defecto 4)
 * @returns Array de subastas destacadas activas
 */
export async function getFeaturedAuctions(
  limitCount: number = 4
): Promise<Auction[]> {
  try {
    const auctionsRef = collection(db, "auctions");
    
    // Consultar subastas destacadas y activas
    try {
      const constraints: QueryConstraint[] = [
        where("isFeatured", "==", true),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      ];

      const q = query(auctionsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const auctions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Asegurar que todos los campos requeridos existan
        const auction: Partial<Auction> & { id: string } = {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "sin-categoria",
          sellerId: data.sellerId || "",
          initialPrice: data.initialPrice || 0,
          currentPrice: data.currentPrice || data.initialPrice || 0,
          image: data.image || "",
          images: data.images || [],
          status: data.status || "active",
          startDate: data.startDate,
          endDate: data.endDate,
          currentBids: data.currentBids || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isFeatured: data.isFeatured === true,
        };
        
        // Campos opcionales
        if (data.reservePrice !== undefined) auction.reservePrice = data.reservePrice;
        if (data.currentBidId) auction.currentBidId = data.currentBidId;
        if (data.location) auction.location = data.location;
        
        auction.endsIn = calculateTimeRemaining(data.endDate);
        return auction as Auction;
      });
      
      console.log(`✅ getFeaturedAuctions: Encontradas ${auctions.length} subastas destacadas`);
      return auctions;
    } catch (error: unknown) {
      // Si falla por falta de índice, intentar sin orderBy
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "failed-precondition" || firebaseError.message?.includes("index")) {
        console.warn("Índice compuesto no encontrado para getFeaturedAuctions, usando consulta simple");
        const constraints: QueryConstraint[] = [
          where("isFeatured", "==", true),
          where("status", "==", "active"),
        ];

        if (limitCount) {
          constraints.push(limit(limitCount));
        }

        const q = query(auctionsRef, ...constraints);
        const querySnapshot = await getDocs(q);

        // Ordenar manualmente en memoria por fecha de creación
        const auctions = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const auction: Partial<Auction> & { id: string } = {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            category: data.category || "sin-categoria",
            sellerId: data.sellerId || "",
            initialPrice: data.initialPrice || 0,
            currentPrice: data.currentPrice || data.initialPrice || 0,
            image: data.image || "",
            images: data.images || [],
            status: data.status || "active",
            startDate: data.startDate,
            endDate: data.endDate,
            currentBids: data.currentBids || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isFeatured: data.isFeatured === true,
          };
          
          if (data.reservePrice !== undefined) auction.reservePrice = data.reservePrice;
          if (data.currentBidId) auction.currentBidId = data.currentBidId;
          if (data.location) auction.location = data.location;
          
          auction.endsIn = calculateTimeRemaining(data.endDate);
          return auction as Auction;
        });

        // Ordenar por createdAt descendente
        return auctions.sort((a, b) => {
          const dateA = timestampToDate(a.createdAt).getTime();
          const dateB = timestampToDate(b.createdAt).getTime();
          return dateB - dateA;
        });
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error("Error en getFeaturedAuctions:", error);
    // Retornar array vacío en lugar de lanzar error
    return [];
  }
}

/**
 * Obtiene subastas por categoría
 * @param categoryId ID de la categoría
 * @param status Estado de la subasta (opcional, por defecto "active")
 * @returns Array de subastas
 */
export async function getAuctionsByCategory(
  categoryId: string,
  status: AuctionStatus = "active"
): Promise<Auction[]> {
  const auctionsRef = collection(db, "auctions");
  const q = query(
    auctionsRef,
    where("category", "==", categoryId),
    where("status", "==", status),
    orderBy("endDate", "asc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      endsIn: calculateTimeRemaining(data.endDate),
    } as Auction;
  });
}

/**
 * Obtiene subastas por vendedor
 * @param sellerId ID del vendedor
 * @returns Array de subastas
 */
export async function getAuctionsBySeller(
  sellerId: string
): Promise<Auction[]> {
  try {
    const auctionsRef = collection(db, "auctions");
    
    // Intentar consulta con índice compuesto primero
    try {
      const q = query(
        auctionsRef,
        where("sellerId", "==", sellerId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const auctions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const auction: Partial<Auction> & { id: string } = {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "sin-categoria",
          sellerId: data.sellerId || "",
          initialPrice: data.initialPrice || 0,
          currentPrice: data.currentPrice || data.initialPrice || 0,
          image: data.image || "",
          images: data.images || [],
          status: data.status || "active",
          startDate: data.startDate,
          endDate: data.endDate,
          currentBids: data.currentBids || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        
        // Campos opcionales
        if (data.reservePrice !== undefined) auction.reservePrice = data.reservePrice;
        if (data.currentBidId) auction.currentBidId = data.currentBidId;
        if (data.location) auction.location = data.location;
        if (data.isFeatured !== undefined) auction.isFeatured = data.isFeatured === true;
        
        auction.endsIn = calculateTimeRemaining(data.endDate);
        return auction as Auction;
      });
      
      console.log(`✅ getAuctionsBySeller: Encontradas ${auctions.length} subastas para el vendedor ${sellerId}`);
      return auctions;
    } catch (error: unknown) {
      // Si falla por falta de índice, intentar sin orderBy
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "failed-precondition" || firebaseError.message?.includes("index")) {
        console.warn("Índice compuesto no encontrado para getAuctionsBySeller, usando consulta simple");
        const q = query(
          auctionsRef,
          where("sellerId", "==", sellerId)
        );

        const querySnapshot = await getDocs(q);

        // Ordenar manualmente en memoria por fecha de creación
        const auctions = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const auction: Partial<Auction> & { id: string } = {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            category: data.category || "sin-categoria",
            sellerId: data.sellerId || "",
            initialPrice: data.initialPrice || 0,
            currentPrice: data.currentPrice || data.initialPrice || 0,
            image: data.image || "",
            images: data.images || [],
            status: data.status || "active",
            startDate: data.startDate,
            endDate: data.endDate,
            currentBids: data.currentBids || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
          
          if (data.reservePrice !== undefined) auction.reservePrice = data.reservePrice;
          if (data.currentBidId) auction.currentBidId = data.currentBidId;
          if (data.location) auction.location = data.location;
          if (data.isFeatured !== undefined) auction.isFeatured = data.isFeatured === true;
          
          auction.endsIn = calculateTimeRemaining(data.endDate);
          return auction as Auction;
        });

        // Ordenar por createdAt descendente manualmente
        return auctions.sort((a, b) => {
          const dateA = timestampToDate(a.createdAt).getTime();
          const dateB = timestampToDate(b.createdAt).getTime();
          return dateB - dateA;
        });
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error("Error en getAuctionsBySeller:", error);
    const firebaseError = error as { code?: string; message?: string };
    
    // Si es un error de índice, proporcionar información útil
    if (firebaseError.code === "failed-precondition") {
      console.error(
        "❌ Error: Falta el índice compuesto para getAuctionsBySeller.\n" +
        "Crea un índice en Firestore con:\n" +
        "- Campo: sellerId (Ascendente)\n" +
        "- Campo: createdAt (Descendente)\n" +
        "Consulta: FIRESTORE_INDEXES.md para más detalles"
      );
    }
    
    // Retornar array vacío en lugar de lanzar error para que la página no falle
    return [];
  }
}

/**
 * Obtiene todas las subastas (con filtros opcionales)
 * @param status Estado de la subasta (opcional)
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de subastas
 */
export async function getAllAuctions(
  status?: AuctionStatus,
  limitCount?: number
): Promise<Auction[]> {
  const auctionsRef = collection(db, "auctions");
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (status) {
    constraints.unshift(where("status", "==", status));
  }

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const q = query(auctionsRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      endsIn: calculateTimeRemaining(data.endDate),
    } as Auction;
  });
}

/**
 * Obtiene subastas que están por terminar pronto
 * @param hoursHoras Horas antes de terminar
 * @returns Array de subastas
 */
export async function getAuctionsEndingSoon(
  hoursHoras: number = 24
): Promise<Auction[]> {
  const now = new Date();
  const endTime = new Date(now.getTime() + hoursHoras * 60 * 60 * 1000);

  const auctionsRef = collection(db, "auctions");
  const q = query(
    auctionsRef,
    where("status", "==", "active"),
    where("endDate", "<=", Timestamp.fromDate(endTime)),
    where("endDate", ">", Timestamp.fromDate(now)),
    orderBy("endDate", "asc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      endsIn: calculateTimeRemaining(data.endDate),
    } as Auction;
  });
}

// ============================================================================
// ACTUALIZAR SUBASTA
// ============================================================================

/**
 * Actualiza una subasta
 * @param auctionId ID de la subasta
 * @param updateData Datos a actualizar
 */
export async function updateAuction(
  auctionId: string,
  updateData: AuctionUpdateInput
): Promise<void> {
  const auctionRef = doc(db, "auctions", auctionId);

  await updateDoc(auctionRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Actualiza el precio actual y la puja ganadora de una subasta
 * @param auctionId ID de la subasta
 * @param newPrice Nuevo precio actual
 * @param bidId ID de la puja ganadora
 */
export async function updateAuctionCurrentBid(
  auctionId: string,
  newPrice: number,
  bidId: string
): Promise<void> {
  const auction = await getAuction(auctionId);
  if (!auction) return;

  const auctionRef = doc(db, "auctions", auctionId);
  await updateDoc(auctionRef, {
    currentPrice: newPrice,
    currentBidId: bidId,
    currentBids: (auction.currentBids || 0) + 1,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cambia el estado de una subasta
 * @param auctionId ID de la subasta
 * @param status Nuevo estado
 */
export async function updateAuctionStatus(
  auctionId: string,
  status: AuctionStatus
): Promise<void> {
  const auctionRef = doc(db, "auctions", auctionId);
  await updateDoc(auctionRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marca una subasta como finalizada
 * @param auctionId ID de la subasta
 */
export async function endAuction(auctionId: string): Promise<void> {
  await updateAuctionStatus(auctionId, "ended");
}

// ============================================================================
// ELIMINAR SUBASTA
// ============================================================================

/**
 * Elimina una subasta (solo si no tiene pujas)
 * @param auctionId ID de la subasta
 */
export async function deleteAuction(auctionId: string): Promise<void> {
  const auction = await getAuction(auctionId);
  if (!auction) return;

  // Solo permitir eliminar si no tiene pujas
  if (auction.currentBids && auction.currentBids > 0) {
    throw new Error("No se puede eliminar una subasta con pujas");
  }

  const auctionRef = doc(db, "auctions", auctionId);
  await deleteDoc(auctionRef);
}

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Verifica si una subasta está activa
 * @param auction Subasta a verificar
 * @returns true si está activa, false si no
 */
export function isAuctionActive(auction: Auction): boolean {
  if (auction.status !== "active") return false;

  const endDate =
    auction.endDate instanceof Date
      ? auction.endDate
      : auction.endDate.toDate();
  return endDate > new Date();
}

/**
 * Obtiene el tiempo restante de una subasta en formato legible
 * @param auction Subasta
 * @returns String con el tiempo restante
 */
export function getAuctionTimeRemaining(auction: Auction): string {
  return calculateTimeRemaining(auction.endDate);
}

