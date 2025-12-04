/** API para gestionar categorías */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllCategories,
  getActiveCategories,
  getCategory,
  createCategory,
} from "@/lib/models/categories";
import type { CategoryCreateInput } from "@/lib/models/types";

// Obtener categorías
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const activeOnly = searchParams.get("activeOnly") !== "false"; 

    if (id) {
      // Obtener una categoría específica
      const category = await getCategory(id);
      if (!category) {
        return NextResponse.json(
          { error: "Categoría no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(category);
    }

    // Obtener todas las categorías o solo las activas
    let categories;
    try {
      if (activeOnly) {
        categories = await getActiveCategories();
      } else {
        categories = await getAllCategories();
      }
    } catch (error: unknown) {
      // Si falla getActiveCategories por falta de índice, usar getAllCategories y filtrar
      if (activeOnly && error instanceof Error && error.message?.includes("index")) {
        console.warn("⚠️ Índice compuesto faltante, usando fallback con getAllCategories");
        const allCategories = await getAllCategories();
        categories = allCategories.filter((cat) => cat.isActive !== false);
      } else {
        throw error;
      }
    }

    return NextResponse.json(categories || []);
  } catch (error: unknown) {
    console.error("Error al obtener categorías:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al obtener las categorías";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Crear una nueva categoría (solo admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoryData: CategoryCreateInput = {
      id: body.id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      image: body.image,
      isActive: body.isActive ?? true,
    };

    // Validaciones básicas
    if (!categoryData.id || !categoryData.name || !categoryData.slug) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: id, name, slug" },
        { status: 400 }
      );
    }

    const categoryId = await createCategory(categoryData);
    return NextResponse.json({ id: categoryId, success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear categoría:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al crear la categoría";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

