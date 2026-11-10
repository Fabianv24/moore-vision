
import { supabase } from '../supabase';

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
