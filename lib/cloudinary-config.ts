
export const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if(!cloudName || !uploadPreset) {
  throw new Error('Falta configuración de Cloudinary');
}