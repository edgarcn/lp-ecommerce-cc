import { Injectable, computed, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

const STORAGE_KEY = 'velour.cart';

export interface StockAdjustment {
  name: string;
  type: 'reduced' | 'removed';
  newQuantity?: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productService = inject(ProductService);

  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  add(product: Product, quantity = 1): void {
    const items = [...this._items()];
    const existing = items.find((i) => i.productId === product.productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product.productId,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity,
      });
    }
    this.commit(items);
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const items = this._items().map((i) =>
      i.productId === productId ? { ...i, quantity } : i,
    );
    this.commit(items);
  }

  increment(productId: number): void {
    const item = this._items().find((i) => i.productId === productId);
    if (item) this.setQuantity(productId, item.quantity + 1);
  }

  decrement(productId: number): void {
    const item = this._items().find((i) => i.productId === productId);
    if (item) this.setQuantity(productId, item.quantity - 1);
  }

  remove(productId: number): void {
    this.commit(this._items().filter((i) => i.productId !== productId));
  }

  clear(): void {
    this.commit([]);
  }

  /**
   * Re-checks every cart item against live stock. Reduces quantities that
   * exceed available stock and removes items that are out of stock.
   * Returns the list of adjustments so the caller can notify the customer.
   */
  async validateStock(): Promise<StockAdjustment[]> {
    const adjustments: StockAdjustment[] = [];
    const next: CartItem[] = [];

    for (const item of this._items()) {
      let product: Product;
      try {
        product = await firstValueFrom(this.productService.getById(item.productId));
      } catch {
        // Product no longer retrievable (deleted/inactive) -> treat as out of stock.
        adjustments.push({ name: item.name, type: 'removed' });
        continue;
      }

      if (!product.active || product.currentStock <= 0) {
        adjustments.push({ name: item.name, type: 'removed' });
        continue;
      }

      if (item.quantity > product.currentStock) {
        adjustments.push({ name: item.name, type: 'reduced', newQuantity: product.currentStock });
        next.push({ ...item, price: product.price, quantity: product.currentStock });
      } else {
        next.push({ ...item, price: product.price });
      }
    }

    this.commit(next);
    return adjustments;
  }

  private commit(items: CartItem[]): void {
    this._items.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
