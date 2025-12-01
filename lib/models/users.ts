/** Funciones CRUD para usuarios */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type { User, UserCreateInput, UserUpdateInput, UserWithStats } from "./types";

// ============================================================================
// CREAR USUARIO
// ============================================================================

/**
 * Crea un nuevo usuario en Firestore
 * @param userData Datos del usuario a crear
 * @returns ID del usuario creado
 */
export async function createUser(userData: UserCreateInput): Promise<string> {
  const userRef = doc(db, "users", userData.id);
  
  // Construir el objeto de usuario sin campos undefined
  const user: Record<string, any> = {
    email: userData.email || "",
    username: userData.username || "",
    displayName: userData.displayName || "",
    phone: userData.phone || "",
    photoURL: userData.photoURL || "",
    termsAccepted: userData.termsAccepted === true,
    conditionsAccepted: userData.conditionsAccepted === true,
    isActive: true,
    isVerified: false,
    totalBids: 0,
    wonAuctions: 0,
    rating: 0,
    totalRatings: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Solo agregar address si está definido y tiene contenido
  if (userData.address && typeof userData.address === "object") {
    const address: Record<string, any> = {};
    if (userData.address.street) address.street = userData.address.street;
    if (userData.address.city) address.city = userData.address.city;
    if (userData.address.state) address.state = userData.address.state;
    if (userData.address.zipCode) address.zipCode = userData.address.zipCode;
    if (userData.address.country) address.country = userData.address.country;
    
    // Solo agregar address si tiene al menos un campo
    if (Object.keys(address).length > 0) {
      user.address = address;
    }
  }

  await setDoc(userRef, user);
  return userData.id;
}

// ============================================================================
// OBTENER USUARIO
// ============================================================================

/**
 * Obtiene un usuario por su ID
 * @param userId ID del usuario
 * @returns Usuario o null si no existe
 */
export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as User;
}

/**
 * Obtiene un usuario por su email
 * @param email Email del usuario
 * @returns Usuario o null si no existe
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as User;
}

/**
 * Obtiene múltiples usuarios por sus IDs
 * @param userIds Array de IDs de usuarios
 * @returns Array de usuarios encontrados
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  const users: User[] = [];
  
  for (const userId of userIds) {
    const user = await getUser(userId);
    if (user) {
      users.push(user);
    }
  }
  
  return users;
}

// ============================================================================
// ACTUALIZAR USUARIO
// ============================================================================

/**
 * Actualiza los datos de un usuario
 * @param userId ID del usuario
 * @param updateData Datos a actualizar
 */
export async function updateUser(
  userId: string,
  updateData: UserUpdateInput
): Promise<void> {
  const userRef = doc(db, "users", userId);
  
  await updateDoc(userRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Actualiza el último login de un usuario
 * @param userId ID del usuario
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId);
  
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Incrementa el contador de pujas totales de un usuario
 * @param userId ID del usuario
 */
export async function incrementUserTotalBids(userId: string): Promise<void> {
  const user = await getUser(userId);
  if (!user) return;

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    totalBids: (user.totalBids || 0) + 1,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Incrementa el contador de subastas ganadas de un usuario
 * @param userId ID del usuario
 */
export async function incrementUserWonAuctions(userId: string): Promise<void> {
  const user = await getUser(userId);
  if (!user) return;

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    wonAuctions: (user.wonAuctions || 0) + 1,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Actualiza la calificación promedio de un usuario
 * @param userId ID del usuario
 * @param newRating Nueva calificación recibida (1-5)
 */
export async function updateUserRating(
  userId: string,
  newRating: number
): Promise<void> {
  const user = await getUser(userId);
  if (!user) return;

  const currentRating = user.rating || 0;
  const totalRatings = user.totalRatings || 0;
  const newTotalRatings = totalRatings + 1;
  const newAverageRating =
    (currentRating * totalRatings + newRating) / newTotalRatings;

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    rating: newAverageRating,
    totalRatings: newTotalRatings,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// OBTENER ESTADÍSTICAS DEL USUARIO
// ============================================================================

/**
 * Obtiene un usuario con estadísticas adicionales
 * @param userId ID del usuario
 * @returns Usuario con estadísticas
 */
export async function getUserWithStats(
  userId: string
): Promise<UserWithStats | null> {
  const user = await getUser(userId);
  if (!user) return null;

  // Obtener pujas activas del usuario
  const { getActiveBidsByUser } = await import("./bids");
  const activeBids = await getActiveBidsByUser(userId);

  return {
    ...user,
    activeBids: activeBids.length,
  };
}

// ============================================================================
// VERIFICAR SI EL USUARIO EXISTE
// ============================================================================

/**
 * Verifica si un usuario existe
 * @param userId ID del usuario
 * @returns true si existe, false si no
 */
export async function userExists(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  return user !== null;
}

