import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, Product, ProductQuery } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  list(query: ProductQuery): Observable<PagedResult<Product>> {
    let params = new HttpParams();
    if (query.name) params = params.set('name', query.name);
    if (query.category) params = params.set('category', query.category);
    if (query.sku) params = params.set('sku', query.sku);
    params = params.set('page', String(query.page ?? 1));
    params = params.set('pageSize', String(query.pageSize ?? 20));
    return this.http.get<PagedResult<Product>>(this.baseUrl, { params });
  }

  getById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${productId}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  create(body: ProductWriteRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, body);
  }

  update(productId: number, body: ProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${productId}`, body);
  }

  deactivate(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }

  batchUpload(file: File): Observable<BatchUploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<BatchUploadResult>(`${this.baseUrl}/batch-upload`, form);
  }
}

export interface ProductWriteRequest {
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  weightKg: number;
}

export type ProductUpdateRequest = Omit<ProductWriteRequest, 'sku'>;

export interface BatchUploadResult {
  created: number;
  updated: number;
  warnings: string[];
  errors: string[];
}
