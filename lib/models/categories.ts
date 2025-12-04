/** Funciones para gestión de categorías */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "./types";

// ============================================================================
// CREAR CATEGORÍA
// ============================================================================

/**
 * Crea una nueva categoría
 * @param categoryData Datos de la categoría
 * @returns ID de la categoría creada
 */
export async function createCategory(
  categoryData: CategoryCreateInput
): Promise<string> {
  const categoryRef = doc(db, "categories", categoryData.id);

  // Construir el objeto de categoría sin campos undefined
  const category: Record<string, any> = {
    name: categoryData.name,
    slug: categoryData.slug,
    isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Solo agregar campos opcionales si están definidos y no son vacíos
  if (categoryData.description && categoryData.description.trim() !== "") {
    category.description = categoryData.description;
  }
  if (categoryData.image && categoryData.image.trim() !== "") {
    category.image = categoryData.image;
  }

  // Usar setDoc con merge: false para crear o sobrescribir
  // Si queremos evitar sobrescribir, primero verificamos existencia
  try {
    const existing = await getDoc(categoryRef);
    if (existing.exists()) {
      throw new Error("La categoría ya existe");
    }
  } catch (error: unknown) {
    // Si el error es de conexión, continuar de todas formas
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === "unavailable" || firebaseError.message?.includes("offline")) {
      console.warn("No se pudo verificar existencia, continuando...");
    } else if (error.message.includes("ya existe")) {
      throw error;
    }
    // Para otros errores, continuar e intentar crear
  }

  await setDoc(categoryRef, category);
  return categoryData.id;
}

// ============================================================================
// OBTENER CATEGORÍAS
// ============================================================================

/**
 * Obtiene una categoría por su ID
 * @param categoryId ID de la categoría
 * @returns Categoría o null si no existe
 */
export async function getCategory(categoryId: string): Promise<Category | null> {
  const categoryRef = doc(db, "categories", categoryId);
  const categorySnap = await getDoc(categoryRef);

  if (!categorySnap.exists()) {
    return null;
  }

  return {
    id: categorySnap.id,
    ...categorySnap.data(),
  } as Category;
}

/**
 * Obtiene una categoría por su slug
 * @param slug Slug de la categoría
 * @returns Categoría o null si no existe
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categoriesRef = collection(db, "categories");
  const q = query(categoriesRef, where("slug", "==", slug), limit(1));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Category;
}

/**
 * Obtiene todas las categorías activas
 * @returns Array de categorías activas
 */
export async function getActiveCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, "categories");
  const q = query(
    categoriesRef,
    where("isActive", "==", true),
    orderBy("name", "asc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

/**
 * Obtiene todas las categorías (activas e inactivas)
 * @returns Array de todas las categorías
 */
export async function getAllCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, "categories");
  const q = query(categoriesRef, orderBy("name", "asc"));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

/**
 * Obtiene múltiples categorías por sus IDs
 * @param categoryIds Array de IDs de categorías
 * @returns Array de categorías encontradas
 */
export async function getCategoriesByIds(
  categoryIds: string[]
): Promise<Category[]> {
  const categories: Category[] = [];

  for (const categoryId of categoryIds) {
    const category = await getCategory(categoryId);
    if (category) {
      categories.push(category);
    }
  }

  return categories;
}

// ============================================================================
// ACTUALIZAR CATEGORÍA
// ============================================================================

/**
 * Actualiza una categoría
 * @param categoryId ID de la categoría
 * @param updateData Datos a actualizar
 */
export async function updateCategory(
  categoryId: string,
  updateData: CategoryUpdateInput
): Promise<void> {
  const categoryRef = doc(db, "categories", categoryId);

  await updateDoc(categoryRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Activa o desactiva una categoría
 * @param categoryId ID de la categoría
 * @param isActive Estado activo/inactivo
 */
export async function setCategoryActive(
  categoryId: string,
  isActive: boolean
): Promise<void> {
  const categoryRef = doc(db, "categories", categoryId);
  await updateDoc(categoryRef, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

// ============================================================================
// ELIMINAR CATEGORÍA
// ============================================================================

/**
 * Elimina una categoría (solo si no tiene subastas asociadas)
 * @param categoryId ID de la categoría
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  // Verificar si hay subastas asociadas
  const { getAuctionsByCategory } = await import("./auctions");
  const auctions = await getAuctionsByCategory(categoryId, "active");

  if (auctions.length > 0) {
    throw new Error(
      "No se puede eliminar una categoría con subastas activas"
    );
  }

  const categoryRef = doc(db, "categories", categoryId);
  await deleteDoc(categoryRef);
}

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Verifica si una categoría existe
 * @param categoryId ID de la categoría
 * @returns true si existe, false si no
 */
export async function categoryExists(categoryId: string): Promise<boolean> {
  const category = await getCategory(categoryId);
  return category !== null;
}

/**
 * Obtiene el nombre legible de una categoría por su ID o slug
 * @param identifier ID o slug de la categoría
 * @returns Nombre de la categoría o el identificador si no se encuentra
 */
export async function getCategoryName(identifier: string): Promise<string> {
  // Intentar obtener por ID primero
  let category = await getCategory(identifier);

  // Si no se encuentra, intentar por slug
  if (!category) {
    category = await getCategoryBySlug(identifier);
  }

  return category ? category.name : identifier;
}

/**
 * Inicializa las categorías por defecto si no existen
 * Útil para la primera configuración de la aplicación
 */
export async function initializeDefaultCategories(): Promise<void> {
  const defaultCategories: CategoryCreateInput[] = [
    {
      id: "arte",
      name: "Arte",
      slug: "arte",
      description: "Obras de arte, pinturas, esculturas y arte decorativo",
      isActive: true,
    },
    {
      id: "automoviles",
      name: "Automóviles",
      slug: "automoviles",
      description: "Vehículos, autos clásicos y accesorios automotrices",
      isActive: true,
    },
    {
      id: "juguetes",
      name: "Juguetes",
      slug: "juguetes",
      description: "Juguetes, figuras de colección y juegos",
      isActive: true,
    },
  ];

  for (const categoryData of defaultCategories) {
    try {
      const exists = await categoryExists(categoryData.id);
      if (!exists) {
        await createCategory(categoryData);
      }
    } catch (error) {
      console.error(`Error al crear categoría ${categoryData.id}:`, error);
    }
  }
}

