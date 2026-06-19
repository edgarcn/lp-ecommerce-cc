import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { StorefrontUiService } from '../../../core/services/storefront-ui.service';
import { ProductImage } from '../../../shared/components/product-image/product-image';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink, ProductImage],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly ui = inject(StorefrontUiService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly quantity = signal(1);

  constructor() {
    this.ui.setShowSearch(true);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  increment(): void {
    const p = this.product();
    if (p && this.quantity() < p.currentStock) this.quantity.update((q) => q + 1);
  }

  decrement(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p || p.currentStock <= 0) return;
    this.cart.add(p, this.quantity());
    this.toast.success(`${this.quantity()} × "${p.name}" added to cart.`);
  }
}
