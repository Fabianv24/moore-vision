
export type ProductCategory = 'Hombre' | 'Mujer' | 'Unisex';

export type ProductShape =
  | 'Rectangular'
  | 'Redonda'
  | 'Cuadrada'
  | 'Aviador'
  | 'Cat-eye'
  | 'Geométrica'
  | 'Otra';

export interface Product {
  id: string;
  name: string;
  reference: string;
  price: number;
  category: ProductCategory;
  shape: ProductShape | null;
  image: string;
  available: boolean;
  is_new: boolean;
}
