import { CurrencyPipe } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductImage } from '../product-image/product-image';

@Component({
  selector: 'app-cart-pane',
  imports: [ProductImage, CurrencyPipe],
  templateUrl: './cart-pane.html',
  styleUrl: './cart-pane.css',
})
export class CartPane {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly cart = inject(CartService);

  readonly close = output<void>();
  readonly validating = signal(false);

  async checkout(): Promise<void> {
    if (this.cart.items().length === 0) return;
    this.validating.set(true);
    try {
      const adjustments = await this.cart.validateStock();
      for (const adj of adjustments) {
        if (adj.type === 'removed') {
          this.toast.warning(`"${adj.name}" is out of stock and was removed from your cart.`);
        } else {
          this.toast.warning(`Only ${adj.newQuantity} of "${adj.name}" left — quantity adjusted.`);
        }
      }
      if (this.cart.items().length === 0) {
        this.toast.info('Your cart is empty after stock checks.');
        return;
      }
      this.close.emit();
      this.router.navigate(['/checkout']);
    } finally {
      this.validating.set(false);
    }
  }
}
