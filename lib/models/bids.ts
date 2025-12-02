/** Funciones CRUD para pujas */

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { Bid, BidCreateInput, BidStatus, BidWithUser, Auction } from "./types";
import {
  getAuction,
  updateAuctionCurrentBid,
  updateAuctionStatus,
} from "./auctions";
import { incrementUserTotalBids, getUser } from "./users";

// ============================================================================
// CREAR PUJA
// ============================================================================

/**
 * Crea una nueva puja en una subasta
 * Valida que la puja sea mayor que la puja actual y actualiza el estado de la subasta
 * @param bidData Datos de la puja
 * @returns ID de la puja creada
 */
export async function createBid(bidData: BidCreateInput): Promise<string> {
  // Validar que la subasta existe y está activa
  const auction = await getAuction(bidData.auctionId);
  if (!auction) {
    throw new Error("La subasta no existe");
  }

  if (auction.status !== "active") {
    throw new Error("La subasta no está activa");
  }

  // Validar que la puja sea mayor que la puja actual
  if (bidData.amount <= auction.currentPrice) {
    throw new Error(
      `La puja debe ser mayor que ${auction.currentPrice.toFixed(2)}`
    );
  }

  // Validar que el usuario no sea el vendedor
  if (bidData.userId === auction.sellerId) {
    throw new Error("El vendedor no puede pujar en su propia subasta");
  }

  // Usar batch para transacciones atómicas
  const batch = writeBatch(db);

  // Crear la nueva puja
  const bidsRef = collection(db, "bids");
  const newBidRef = doc(bidsRef);
  const bid: Omit<Bid, "id"> = {
    auctionId: bidData.auctionId,
    userId: bidData.userId,
    amount: bidData.amount,
    timestamp: serverTimestamp() as Timestamp,
    isWinning: true,
    status: "active",
    createdAt: serverTimestamp() as Timestamp,
  };
  batch.set(newBidRef, bid);

  // Crear también en la subcolección de la subasta
  const auctionBidsRef = collection(
    db,
    "auctions",
    bidData.auctionId,
    "bids"
  );
  const auctionBidRef = doc(auctionBidsRef);
  batch.set(auctionBidRef, bid);

  // Crear también en la subcolección del usuario
  const userBidsRef = collection(db, "users", bidData.userId, "bids");
  const userBidRef = doc(userBidsRef);
  batch.set(userBidRef, {
    ...bid,
    auctionId: bidData.auctionId,
  });

  // Marcar TODAS las pujas anteriores como no ganadoras
  // Obtener todas las pujas de esta subasta que están marcadas como ganadoras
  const winningBidsQuery = query(
    auctionBidsRef,
    where("isWinning", "==", true)
  );
  const winningBidsSnapshot = await getDocs(winningBidsQuery);
  
  // Marcar todas las pujas ganadoras anteriores como no ganadoras
  winningBidsSnapshot.docs.forEach((bidDoc) => {
    const bidRef = doc(db, "auctions", bidData.auctionId, "bids", bidDoc.id);
    batch.update(bidRef, {
      isWinning: false,
      status: "outbid",
    });
    
    // También actualizar en la colección principal de bids si existe
    const mainBidRef = doc(db, "bids", bidDoc.id);
    batch.update(mainBidRef, {
      isWinning: false,
      status: "outbid",
    });
  });

  // Actualizar la subasta
  const auctionRef = doc(db, "auctions", bidData.auctionId);
  batch.update(auctionRef, {
    currentPrice: bidData.amount,
    currentBidId: newBidRef.id,
    currentBids: (auction.currentBids || 0) + 1,
    updatedAt: serverTimestamp(),
  });

  // Ejecutar todas las operaciones
  await batch.commit();

  // Incrementar contador de pujas del usuario
  await incrementUserTotalBids(bidData.userId);

  return newBidRef.id;
}

// ============================================================================
// OBTENER PUJAS
// ============================================================================

/**
 * Obtiene una puja por su ID
 * @param bidId ID de la puja
 * @returns Puja o null si no existe
 */
export async function getBid(bidId: string): Promise<Bid | null> {
  const bidRef = doc(db, "bids", bidId);
  const bidSnap = await getDoc(bidRef);

  if (!bidSnap.exists()) {
    return null;
  }

  return {
    id: bidSnap.id,
    ...bidSnap.data(),
  } as Bid;
}

/**
 * Obtiene las pujas de una subasta
 * @param auctionId ID de la subasta
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de pujas
 */
export async function getBidsByAuction(
  auctionId: string,
  limitCount?: number
): Promise<Bid[]> {
  const bidsRef = collection(db, "auctions", auctionId, "bids");
  const constraints: QueryConstraint[] = [orderBy("amount", "desc")];

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const q = query(bidsRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Bid[];
}

/**
 * Obtiene las pujas de una subasta con información del usuario
 * @param auctionId ID de la subasta
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de pujas con información del usuario
 */
export async function getBidsByAuctionWithUsers(
  auctionId: string,
  limitCount?: number
): Promise<BidWithUser[]> {
  const bids = await getBidsByAuction(auctionId, limitCount);
  
  // Obtener información del usuario para cada puja
  const bidsWithUsers = await Promise.all(
    bids.map(async (bid) => {
      try {
        const user = await getUser(bid.userId);
        return {
          ...bid,
          user: user
            ? {
                id: user.id,
                displayName: user.displayName,
                username: user.username,
                photoURL: user.photoURL,
              }
            : undefined,
        } as BidWithUser;
      } catch (error) {
        console.error(`Error obteniendo usuario ${bid.userId}:`, error);
        return {
          ...bid,
          user: undefined,
        } as BidWithUser;
      }
    })
  );

  return bidsWithUsers;
}

/**
 * Obtiene todas las pujas de un usuario
 * @param userId ID del usuario
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de pujas
 */
export async function getBidsByUser(
  userId: string,
  limitCount?: number
): Promise<Bid[]> {
  const bidsRef = collection(db, "users", userId, "bids");
  const constraints: QueryConstraint[] = [orderBy("timestamp", "desc")];

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const q = query(bidsRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Bid[];
}

/**
 * Obtiene las pujas de un usuario con información de la subasta
 * @param userId ID del usuario
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de pujas con información de la subasta
 */
export async function getBidsByUserWithAuction(
  userId: string,
  limitCount?: number
): Promise<(Bid & { auction: Auction | null })[]> {
  const bids = await getBidsByUser(userId, limitCount);
  
  // Obtener información de la subasta para cada puja
  const bidsWithAuctions = await Promise.all(
    bids.map(async (bid) => {
      try {
        const auction = await getAuction(bid.auctionId);
        return {
          ...bid,
          auction: auction || null,
        };
      } catch (error) {
        console.error(`Error obteniendo subasta ${bid.auctionId}:`, error);
        return {
          ...bid,
          auction: null,
        };
      }
    })
  );

  // Filtrar pujas que no tienen subasta
  return bidsWithAuctions.filter((bid) => bid.auction !== null);
}

/**
 * Obtiene las pujas activas de un usuario
 * @param userId ID del usuario
 * @returns Array de pujas activas
 */
export async function getActiveBidsByUser(userId: string): Promise<Bid[]> {
  const bidsRef = collection(db, "users", userId, "bids");
  const q = query(
    bidsRef,
    where("status", "==", "active"),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Bid[];
}

/**
 * Obtiene las pujas ganadoras de un usuario
 * @param userId ID del usuario
 * @returns Array de pujas ganadoras
 */
export async function getWinningBidsByUser(userId: string): Promise<Bid[]> {
  const bidsRef = collection(db, "users", userId, "bids");
  const q = query(
    bidsRef,
    where("isWinning", "==", true),
    where("status", "==", "active"),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Bid[];
}

/**
 * Obtiene la puja más alta de una subasta
 * @param auctionId ID de la subasta
 * @returns Puja más alta o null si no hay pujas
 */
export async function getHighestBid(auctionId: string): Promise<Bid | null> {
  const bids = await getBidsByAuction(auctionId, 1);
  return bids.length > 0 ? bids[0] : null;
}

// ============================================================================
// VALIDACIONES Y HELPERS
// ============================================================================

/**
 * Verifica si un usuario puede pujar en una subasta
 * @param userId ID del usuario
 * @param auctionId ID de la subasta
 * @returns true si puede pujar, false en caso contrario
 */
export async function canUserBid(
  userId: string,
  auctionId: string
): Promise<boolean> {
  const auction = await getAuction(auctionId);
  if (!auction) return false;

  // No puede pujar si es el vendedor
  if (auction.sellerId === userId) return false;

  // No puede pujar si la subasta no está activa
  if (auction.status !== "active") return false;

  return true;
}

/**
 * Obtiene el monto mínimo requerido para pujar en una subasta
 * @param auctionId ID de la subasta
 * @returns Monto mínimo requerido
 */
export async function getMinimumBidAmount(auctionId: string): Promise<number> {
  const auction = await getAuction(auctionId);
  if (!auction) return 0;

  // El monto mínimo es el precio actual + incremento mínimo (por ejemplo, $1)
  const increment = 1;
  return auction.currentPrice + increment;
}

// ============================================================================
// FINALIZAR PUJAS
// ============================================================================

/**
 * Marca todas las pujas de una subasta como no ganadoras excepto la ganadora
 * @param auctionId ID de la subasta
 * @param winningBidId ID de la puja ganadora
 */
export async function markAllBidsAsOutbid(
  auctionId: string,
  winningBidId: string
): Promise<void> {
  const bids = await getBidsByAuction(auctionId);

  const batch = writeBatch(db);

  for (const bid of bids) {
    if (bid.id !== winningBidId) {
      const bidRef = doc(db, "bids", bid.id);
      batch.update(bidRef, {
        isWinning: false,
        status: "outbid",
        updatedAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();
}

/**
 * Marca una puja como ganadora cuando termina la subasta
 * @param auctionId ID de la subasta
 */
export async function finalizeAuctionBids(auctionId: string): Promise<void> {
  const auction = await getAuction(auctionId);
  if (!auction) return;

  // Si hay una puja ganadora, marcarla como ganadora
  if (auction.currentBidId) {
    const winningBidRef = doc(db, "bids", auction.currentBidId);
    await updateDoc(winningBidRef, {
      isWinning: true,
      status: "winning",
      updatedAt: serverTimestamp(),
    });

    // Marcar todas las demás como no ganadoras
    await markAllBidsAsOutbid(auctionId, auction.currentBidId);

    // Incrementar contador de subastas ganadas del usuario
    const winningBid = await getBid(auction.currentBidId);
    if (winningBid) {
      const { incrementUserWonAuctions } = await import("./users");
      await incrementUserWonAuctions(winningBid.userId);
    }
  }

  // Finalizar la subasta
  await updateAuctionStatus(auctionId, "ended");
}
