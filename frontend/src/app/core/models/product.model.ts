export interface ProductCategory {
  id: number;
  name: string;
  title: string;
  image: string | null;
  display_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  category: ProductCategory;
  title: string;
  description: string | null;
  base_price: number;
  image: string | null;
  options: Record<string, any>;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  category_id: number;
  title: string;
  description?: string;
  base_price: number;
  image?: string;
  options?: Record<string, any>;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface ProductUpdate {
  category_id?: number;
  title?: string;
  description?: string;
  base_price?: number;
  image?: string;
  options?: Record<string, any>;
  stock_quantity?: number;
  is_active?: boolean;
}
