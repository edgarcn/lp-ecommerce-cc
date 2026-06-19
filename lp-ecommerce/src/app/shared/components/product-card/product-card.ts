import { CurrencyPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { ProductImage } from '../product-image/product-image';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink, ProductImage],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();

  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    if (p.currentStock <= 0) return;
    this.cart.add(p, 1);
    this.toast.success(`"${p.name}" added to cart.`);
  }
}
