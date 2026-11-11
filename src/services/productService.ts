
import { supabase } from '../supabase';
import type { Product } from '../types';

export async function getAvailableProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, reference, price, category, image, available, shape, is_new')
    .eq('available', true);

  if (error) {
    throw error;
  }

  return (data ?? []) as Product[];
}
