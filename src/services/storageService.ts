
import { supabase } from '../supabase';

// =====================================================
// SUBIR FOTOGRAFÍAS DE MONTURAS
// =====================================================

export async function uploadProductImage(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  const filePath = fileName;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// =====================================================
// SUBIR FOTOGRAFÍAS Y VIDEOS PUBLICITARIOS
// =====================================================

export async function uploadAdvertisingMedia(file: File): Promise<string> {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
  ];

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Formato no permitido. Utiliza JPG, PNG, WEBP, AVIF, MP4 o WEBM.'
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El archivo no puede superar los 50 MB.');
  }

  const fileExtension =
    file.name.split('.').pop()?.toLowerCase() || 'bin';

  const fileName = `${crypto.randomUUID()}.${fileExtension}`;

  const filePath = `public/${fileName}`;

  const { error } = await supabase.storage
    .from('advertising-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('advertising-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
