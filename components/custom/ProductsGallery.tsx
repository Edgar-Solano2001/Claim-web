"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductsGalleryProps {
  mainImage: string;
  images?: string[];
  title: string;
}

export default function ProductsGallery({ mainImage, images = [], title }: ProductsGalleryProps) {
  // Filtrar imágenes duplicadas y vacías
  const uniqueImages = images.filter((img, idx, arr) => 
    img && img !== mainImage && arr.indexOf(img) === idx
  );
  
  // Combinar imagen principal con imágenes adicionales únicas
  const allImages = mainImage 
    ? [mainImage, ...uniqueImages].filter(Boolean)
    : uniqueImages.filter(Boolean);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Si no hay imágenes, usar la principal
  const selectedImage = allImages[selectedImageIndex] || mainImage;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Imagen principal */}
      <div className="relative w-full aspect-square md:aspect-[4/3] lg:h-[600px]">
        <Card className="w-full h-full border-2 border-purple-100 shadow-lg bg-gradient-to-br from-white to-purple-50/30 overflow-hidden rounded-2xl flex items-center justify-center relative group">
          <Image
            src={selectedImage}
            alt={title}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
          />
        </Card>
      </div>

      {/* Miniaturas - Solo mostrar si hay más de una imagen */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={cn(
                "relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200",
                selectedImageIndex === idx
                  ? "border-purple-600 ring-2 ring-purple-200 ring-offset-2 shadow-md scale-105"
                  : "border-gray-200 opacity-70 hover:opacity-100 hover:border-purple-300 hover:scale-105"
              )}
            >
              <Image
                src={img}
                alt={`${title} - Vista ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}