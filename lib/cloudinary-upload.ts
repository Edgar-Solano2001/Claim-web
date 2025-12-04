import { cloudName, uploadPreset } from './cloudinary-config';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

/**
 * Sube una imagen a Cloudinary usando el upload preset
 * @param file - Archivo de imagen a subir
 * @param folder - Carpeta opcional donde guardar la imagen (ej: 'auctions')
 * @returns Promise con la URL de la imagen subida
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary no está configurado correctamente');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error?.message || 'Error al subir la imagen');
  }

  const data = await response.json();
  
  return {
    url: data.url,
    publicId: data.public_id,
    secureUrl: data.secure_url,
  };
}

/**
 * Sube múltiples imágenes a Cloudinary
 * @param files - Array de archivos de imagen a subir
 * @param folder - Carpeta opcional donde guardar las imágenes
 * @returns Promise con un array de URLs de las imágenes subidas
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  folder?: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    // Retornar las URLs seguras
    return results.map((result) => result.secureUrl);
  } catch (error) {
    console.error('Error al subir múltiples imágenes:', error);
    throw error;
  }
}

