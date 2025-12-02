/** Funciones para historial de visualizaciones */

import {
  doc,
  getDocs,
  addDoc,
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
import type { ViewHistory, ViewHistoryCreateInput } from "./types";

// ============================================================================
// AGREGAR VISUALIZACIÓN AL HISTORIAL
// ============================================================================

/**
 * Agrega una visualización al historial de un usuario
 * Si ya existe una visualización reciente de la misma subasta, la actualiza
 * @param viewData Datos de la visualización
 * @returns ID de la visualización creada o actualizada
 */
export async function addToViewHistory(
  viewData: ViewHistoryCreateInput
): Promise<string> {
  // Verificar si ya existe una visualización reciente (últimas 24 horas)
  const recentViews = await getRecentViewHistory(viewData.userId, 1);
  const existingView = recentViews.find(
    (view) => view.auctionId === viewData.auctionId
  );

  if (existingView) {
    // Actualizar la visualización existente
    const viewRef = doc(
      db,
      "users",
      viewData.userId,
      "viewHistory",
      existingView.id
    );
    await deleteDoc(viewRef);
  }

  // Crear nueva visualización
  const viewHistoryRef = collection(
    db,
    "users",
    viewData.userId,
    "viewHistory"
  );

  const view: Omit<ViewHistory, "id"> = {
    userId: viewData.userId,
    auctionId: viewData.auctionId,
    auctionTitle: viewData.auctionTitle,
    auctionImage: viewData.auctionImage,
    viewedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(viewHistoryRef, view);
  return docRef.id;
}

// ============================================================================
// OBTENER HISTORIAL DE VISUALIZACIONES
// ============================================================================

/**
 * Obtiene el historial de visualizaciones de un usuario
 * @param userId ID del usuario
 * @param limitCount Límite de resultados (opcional, por defecto 50)
 * @returns Array de visualizaciones ordenadas por fecha descendente
 */
export async function getViewHistory(
  userId: string,
  limitCount: number = 50
): Promise<ViewHistory[]> {
  const viewHistoryRef = collection(
    db,
    "users",
    userId,
    "viewHistory"
  );
  const q = query(
    viewHistoryRef,
    orderBy("viewedAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ViewHistory[];
}

/**
 * Obtiene el historial reciente de visualizaciones de un usuario
 * @param userId ID del usuario
 * @param days Días hacia atrás para buscar (por defecto 7)
 * @param limitCount Límite de resultados (opcional)
 * @returns Array de visualizaciones recientes
 */
export async function getRecentViewHistory(
  userId: string,
  days: number = 7,
  limitCount?: number
): Promise<ViewHistory[]> {
  const viewHistoryRef = collection(
    db,
    "users",
    userId,
    "viewHistory"
  );

  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  const timestampLimit = Timestamp.fromDate(dateLimit);

  const constraints: QueryConstraint[] = [
    where("viewedAt", ">=", timestampLimit),
    orderBy("viewedAt", "desc"),
  ];

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const q = query(viewHistoryRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ViewHistory[];
}

/**
 * Obtiene visualizaciones de una subasta específica
 * @param userId ID del usuario
 * @param auctionId ID de la subasta
 * @returns Visualización o null si no existe
 */
export async function getViewHistoryForAuction(
  userId: string,
  auctionId: string
): Promise<ViewHistory | null> {
  const viewHistoryRef = collection(
    db,
    "users",
    userId,
    "viewHistory"
  );
  const q = query(
    viewHistoryRef,
    where("auctionId", "==", auctionId),
    orderBy("viewedAt", "desc"),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as ViewHistory;
}

// ============================================================================
// ELIMINAR DEL HISTORIAL
// ============================================================================

/**
 * Elimina una visualización del historial
 * @param userId ID del usuario
 * @param viewId ID de la visualización
 */
export async function removeFromViewHistory(
  userId: string,
  viewId: string
): Promise<void> {
  const viewRef = doc(
    db,
    "users",
    userId,
    "viewHistory",
    viewId
  );
  await deleteDoc(viewRef);
}

/**
 * Elimina todas las visualizaciones de una subasta del historial
 * @param userId ID del usuario
 * @param auctionId ID de la subasta
 */
export async function removeAuctionFromViewHistory(
  userId: string,
  auctionId: string
): Promise<void> {
  const viewHistoryRef = collection(
    db,
    "users",
    userId,
    "viewHistory"
  );
  const q = query(viewHistoryRef, where("auctionId", "==", auctionId));

  const querySnapshot = await getDocs(q);

  const batch = await import("firebase/firestore").then((m) => m.writeBatch(db));

  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

/**
 * Limpia el historial de visualizaciones antiguas (más de X días)
 * @param userId ID del usuario
 * @param days Días de antigüedad para eliminar (por defecto 30)
 */
export async function cleanOldViewHistory(
  userId: string,
  days: number = 30
): Promise<void> {
  const viewHistoryRef = collection(
    db,
    "users",
    userId,
    "viewHistory"
  );

  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  const timestampLimit = Timestamp.fromDate(dateLimit);

  const q = query(
    viewHistoryRef,
    where("viewedAt", "<", timestampLimit)
  );

  const querySnapshot = await getDocs(q);

  const batch = await import("firebase/firestore").then((m) => m.writeBatch(db));

  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

/**
 * Limpia todo el historial de visualizaciones de un usuario
 * @param userId ID del usuario
 */
export async function clearViewHistory(userId: string): Promise<void> {
  const viewHistory = await getViewHistory(userId, 1000); // Obtener todas

  const batch = await import("firebase/firestore").then((m) => m.writeBatch(db));

  for (const view of viewHistory) {
    const viewRef = doc(
      db,
      "users",
      userId,
      "viewHistory",
      view.id
    );
    batch.delete(viewRef);
  }

  await batch.commit();
}

