"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import type { Category } from "@/lib/models/types";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/custom/ImageUploader";
import { uploadMultipleImagesToCloudinary } from "@/lib/cloudinary-upload";
import Image from "next/image";

export default function CrearSubastaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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
  };

  const handleImagesChange = (files: File[]) => {
    setImageFiles(files);
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

    if (imageFiles.length === 0) {
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
    setUploadingImages(true);

    try {
      // Subir imágenes a Cloudinary
      toast.loading("Subiendo imágenes...", { id: "upload-images" });
      
      const imageUrls = await uploadMultipleImagesToCloudinary(
        imageFiles,
        "auctions"
      );

      if (imageUrls.length === 0) {
        throw new Error("No se pudieron subir las imágenes");
      }

      toast.success("Imágenes subidas correctamente", { id: "upload-images" });

      // La primera imagen es la principal
      const mainImage = imageUrls[0];
      // Las demás son imágenes adicionales
      const additionalImageUrls = imageUrls.slice(1);

      // Crear la subasta con las URLs de las imágenes
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
          image: mainImage,
          images: additionalImageUrls.length > 0 ? additionalImageUrls : undefined,
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
      toast.dismiss("upload-images");
      
      if (error instanceof Error) {
        toast.error(error.message || "Error al crear la subasta");
      } else {
        toast.error("Error al crear la subasta");
      }
    } finally {
      setLoading(false);
      setUploadingImages(false);
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
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
      <div className="col-span-1 max-w-12xl mx-16 my-4">
        <Card className="bg-white border-2 border-purple-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-purple-700">Crear Nueva Subasta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                  <Input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required  className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"/>
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="initialPrice" className="block text-sm font-medium text-gray-700">Precio Inicial (MXN)</label>
                  <Input type="number" id="initialPrice" name="initialPrice" value={formData.initialPrice} onChange={handleInputChange} required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fechaInicio">Fecha de Inicio</label>
                  <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fechaFin">Fecha de Fin</label>
                  <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Imágenes del Producto
                  </label>
                  <ImageUploader 
                    maxImages={6}
                    onImagesChange={handleImagesChange}
                  />
                  {imageFiles.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Debes agregar al menos una imagen para crear la subasta
                    </p>
                  )}
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-green-600">
                      {imageFiles.length} imagen{imageFiles.length !== 1 ? 'es' : ''} seleccionada{imageFiles.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || uploadingImages || categoriesLoading}
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImages ? "Subiendo imágenes..." : loading ? "Creando subasta..." : "Crear Subasta"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1">
        <Image src="/images/crear-subasta.jpg" alt="Crear Subasta" width={1000} height={1000} className="w-[1000px] h-[800px] mx-4 my-40 py-4 px-4 object-cover rounded-3xl shadow-2xl" priority />
      </div>
    </div>
  );
}

