/**
 * Helpers para el seeder que usan Timestamp.now() en lugar de serverTimestamp()
 * Esto evita problemas cuando se ejecuta en Node.js
 */

import { Timestamp } from "firebase/firestore";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import type { CategoryCreateInput, UserCreateInput } from "./types";

/**
 * Crea una categoría usando Timestamp.now() (para uso en seeder)
 * No verifica existencia para evitar errores de conexión
 */
export async function createCategoryForSeed(
  categoryData: CategoryCreateInput
): Promise<string> {
  const categoryRef = doc(db, "categories", categoryData.id);

  // Verificar existencia de forma segura
  try {
    const existing = await getDoc(categoryRef);
    if (existing.exists()) {
      throw new Error("La categoría ya existe");
    }
  } catch (error: any) {
    // Si el error es de conexión, continuar de todas formas
    if (error.code === "unavailable" || error.message?.includes("offline")) {
      // Continuar e intentar crear
    } else if (error.message?.includes("ya existe")) {
      throw error;
    }
    // Para otros errores, continuar e intentar crear
  }

  const category: Record<string, any> = {
    name: String(categoryData.name).trim(),
    slug: String(categoryData.slug).trim(),
    isActive: categoryData.isActive !== undefined ? Boolean(categoryData.isActive) : true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (categoryData.description && String(categoryData.description).trim() !== "") {
    category.description = String(categoryData.description).trim();
  }
  if (categoryData.image && String(categoryData.image).trim() !== "") {
    category.image = String(categoryData.image).trim();
  }

  await setDoc(categoryRef, category);
  return categoryData.id;
}

/**
 * Crea un usuario usando Timestamp.now() (para uso en seeder)
 */
export async function createUserForSeed(
  userData: UserCreateInput
): Promise<string> {
  const userRef = doc(db, "users", userData.id);

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
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (userData.address && typeof userData.address === "object") {
    const address: Record<string, any> = {};
    if (userData.address.street) address.street = userData.address.street;
    if (userData.address.city) address.city = userData.address.city;
    if (userData.address.state) address.state = userData.address.state;
    if (userData.address.zipCode) address.zipCode = userData.address.zipCode;
    if (userData.address.country) address.country = userData.address.country;

    if (Object.keys(address).length > 0) {
      user.address = address;
    }
  }

  await setDoc(userRef, user);
  return userData.id;
}

