export type ProductCategory = 'Hombre' | 'Mujer' | 'Unisex';

export interface Product {
  id: string;
  name: string;
  reference: string;
  price: number;
  category: ProductCategory;
  image: string;
  available: boolean;
}