"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange?: (images: File[]) => void;
}

export default function ImageUploader({ maxImages = 6, onImagesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const newImages = [...images, ...filesToAdd];
    
    // Crear previews
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    
    setImages(newImages);
    setPreviews([...previews, ...newPreviews]);
    
    if (onImagesChange) {
      onImagesChange(newImages);
    }

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revocar URL del objeto para liberar memoria
    URL.revokeObjectURL(previews[index]);
    
    setImages(newImages);
    setPreviews(newPreviews);
    
    if (onImagesChange) {
      onImagesChange(newImages);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          Imágenes del producto ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <Button
            type="button"
            onClick={handleClick}
            variant="outline"
            className="text-sm"
          >
            Agregar imagen
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={images.length >= maxImages}
      />

      {images.length === 0 ? (
        <div
          onClick={handleClick}
          className="w-full h-48 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50/50 cursor-pointer hover:bg-purple-100/50 transition flex flex-col items-center justify-center gap-3"
        >
          <svg
            className="w-12 h-12 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-purple-600">
              Haz clic para subir imágenes
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Máximo {maxImages} imágenes (JPG, PNG o GIF)
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-200 bg-white group"
            >
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Imagen {index + 1}
              </div>
            </div>
          ))}
          
          {images.length < maxImages && (
            <div
              onClick={handleClick}
              className="relative aspect-square rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 cursor-pointer hover:bg-purple-100/50 transition flex flex-col items-center justify-center gap-2"
            >
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs text-purple-600 font-medium">
                Agregar más
              </span>
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-slate-500">
          Puedes agregar hasta {maxImages - images.length} imagen{maxImages - images.length !== 1 ? 'es' : ''} más.
        </p>
      )}
    </div>
  );
}

