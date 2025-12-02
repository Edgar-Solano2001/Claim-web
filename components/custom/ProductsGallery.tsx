"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProductImage = {
  id: number;
  imageUrl: string;
  title: string;
};

// Datos de ejemplo (idealmente esto vendría por props)
const sampleImages: ProductImage[] = [
  { id: 1, imageUrl: "/images/batman.jpg", title: "Batman Principal" },
  { id: 2, imageUrl: "/images/mudi.jpg", title: "Salvator Mundi" },
  { id: 3, imageUrl: "/images/messi.jpeg", title: "Firma Messi" },
  // Duplicamos para simular más imágenes si es necesario
  { id: 4, imageUrl: "/images/batman.jpg", title: "Detalle Batman" }, 
];

export default function ProductsGallery() {
  const [selectedImage, setSelectedImage] = useState<ProductImage>(sampleImages[0]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full aspect-square md:aspect-[4/3] lg:h-[500px]">
        <Card className="w-full h-full border-2 border-purple-100 shadow-sm bg-white overflow-hidden rounded-xl flex items-center justify-center relative">
          <Image
            src={selectedImage.imageUrl}
            alt={selectedImage.title}
            fill
            className="object-contain p-2"
            priority
          />
        </Card>
      </div>

      {/* MINIATURAS (THUMBNAILS) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
        {sampleImages.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              selectedImage.id === img.id
                ? "border-purple-600 ring-2 ring-purple-200 ring-offset-1"
                : "border-transparent opacity-70 hover:opacity-100 hover:border-purple-300"
            )}
          >
            <Image
              src={img.imageUrl}
              alt={img.title}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}