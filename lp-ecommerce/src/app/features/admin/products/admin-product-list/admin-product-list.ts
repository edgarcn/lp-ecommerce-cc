import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

type SortKey = 'productId' | 'name' | 'price' | 'currentStock';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-admin-product-list',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './admin-product-list.html',
  styleUrl: './admin-product-list.css',
})
export class AdminProductList {
  private readonly productService = inject(ProductService);

  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly products = signal<Product[]>([]);

  readonly sortKey = signal<SortKey>('productId');
  readonly sortDir = signal<SortDir>('asc');

  readonly sorted = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.products()].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv) * dir;
      }
      return ((av as number) - (bv as number)) * dir;
    });
  });

  constructor() {
    this.productService.list({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.products.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }
}
