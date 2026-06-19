export interface Product {
  productId: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  currency: string;
  currentStock: number;
  weightKg: number;
  active: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductQuery {
  name?: string;
  category?: string;
  sku?: string;
  page?: number;
  pageSize?: number;
}
