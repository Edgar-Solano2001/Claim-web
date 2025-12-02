"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import Image from "next/image";
import type { Category } from "@/lib/models/types";

export default function CrearSubastaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    initialPrice: "",
    reservePrice: "",
    image: "",
    images: [] as string[],
    location: "",
    startDate: "",
    endDate: "",
    duration: "7", // días por defecto
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Debes iniciar sesión para crear una subasta");
      router.push("/Login");
      return;
    }

    fetchCategories();
  }, [user, authLoading, router]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
      const response = await fetch(`${baseUrl}/api/categories?activeOnly=true`, {
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
        console.log(`✅ Categorías cargadas: ${Array.isArray(data) ? data.length : 0}`);
      } else {
        // Intentar obtener el mensaje de error
        let errorMessage = "Error al cargar las categorías";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("Error al obtener categorías:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
        } catch (parseError) {
          console.error("Error al parsear respuesta:", parseError);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
      console.error("Error al obtener categorías (catch):", error);
      toast.error(error.message || "Error al cargar las categorías. Por favor, recarga la página.");
      } else {
      console.error("Error al obtener categorías (catch):", error);
      toast.error("Error al cargar las categorías. Por favor, recarga la página.");
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "duration") {
      // Calcular fecha de fin basada en la duración
      const days = parseInt(value) || 7;
      const startDate = formData.startDate 
        ? new Date(formData.startDate)
        : new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      
      setFormData({
        ...formData,
        duration: value,
        endDate: endDate.toISOString().slice(0, 16),
      });
    } else if (name === "startDate") {
      // Recalcular fecha de fin cuando cambia la fecha de inicio
      const days = parseInt(formData.duration) || 7;
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      
      setFormData({
        ...formData,
        startDate: value,
        endDate: endDate.toISOString().slice(0, 16),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Preview de imagen principal
    if (name === "image") {
      setImagePreview(value);
    }
  };

  const addAdditionalImage = () => {
    const url = prompt("Ingresa la URL de la imagen:");
    if (url && url.trim()) {
      setAdditionalImages([...additionalImages, url.trim()]);
      setFormData({
        ...formData,
        images: [...additionalImages, url.trim()],
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Debes iniciar sesión para crear una subasta");
      return;
    }

    // Validaciones
    if (!formData.title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (!formData.category) {
      toast.error("Debes seleccionar una categoría");
      return;
    }

    if (!formData.initialPrice || parseFloat(formData.initialPrice) <= 0) {
      toast.error("El precio inicial debe ser mayor que 0");
      return;
    }

    if (!formData.image.trim()) {
      toast.error("Debes agregar al menos una imagen");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Debes seleccionar las fechas de inicio y fin");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          sellerId: user.uid,
          initialPrice: parseFloat(formData.initialPrice),
          reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
          image: formData.image.trim(),
          images: additionalImages.length > 0 ? additionalImages : undefined,
          location: formData.location.trim() || undefined,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la subasta");
      }

      toast.success("¡Subasta creada exitosamente!");
      router.push(`/Subastas/${data.id}`);
    } catch (error: unknown) {
      console.error("Error al crear subasta:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Error al crear la subasta");
      } else {
        toast.error("Error al crear la subasta");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent mb-2">
            Crear Nueva Subasta
          </h1>
          <p className="text-gray-600">
            Completa el formulario para publicar tu producto en subasta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card className="bg-white border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-900">
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la subasta *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="Ej: Pintura al óleo - Paisaje montañoso"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                  placeholder="Describe detalladamente tu producto..."
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                {categoriesLoading ? (
                  <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-gray-500 text-sm">Cargando categorías...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="w-full px-4 py-2 border-2 border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-yellow-700 text-sm">
                      No hay categorías disponibles. Por favor, contacta al administrador.
                    </p>
                  </div>
                ) : (
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none bg-white"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                {categories.length > 0 && !categoriesLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    {categories.length} categoría{categories.length !== 1 ? 's' : ''} disponible{categories.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card className="bg-white border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-900">
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="initialPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Inicial (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    id="initialPrice"
                    name="initialPrice"
                    value={formData.initialPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    className="w-full pl-8 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card className="bg-white border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-900">
                Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen Principal (URL) *
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
                {imagePreview && (
                  <div className="mt-3 relative w-full h-64 rounded-lg overflow-hidden border-2 border-purple-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes Adicionales (Opcional)
                </label>
                <Button
                  type="button"
                  onClick={addAdditionalImage}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  + Agregar Imagen
                </Button>
                {additionalImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {additionalImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-200">
                          <Image
                            src={img}
                            alt={`Imagen ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fechas y Duración */}
          <Card className="bg-white border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-900">
                Fechas y Duración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (días) *
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="1">1 día</option>
                  <option value="3">3 días</option>
                  <option value="7">7 días</option>
                  <option value="14">14 días</option>
                  <option value="30">30 días</option>
                </select>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Finalización *
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Ubicación (Opcional) */}
          <Card className="bg-white border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-900">
                Ubicación (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="Ej: Ciudad, País"
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Publicar Subasta
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

