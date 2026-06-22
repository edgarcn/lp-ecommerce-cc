import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateOrderRequest, PaymentMethod } from '../../../core/models/order.model';
import { ProductImage } from '../../../shared/components/product-image/product-image';

@Component({
  selector: 'app-summary',
  imports: [CurrencyPipe, ProductImage],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  private readonly router = inject(Router);
  private readonly state = inject(CheckoutStateService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  readonly cart = inject(CartService);

  readonly draft = this.state.draft;
  readonly placing = signal(false);

  readonly cardLast4 = computed(() => {
    const num = this.draft().payment?.cardNumber?.replace(/\D/g, '') ?? '';
    return num.slice(-4);
  });

  constructor() {
    if (!this.state.hasShipment() || !this.state.hasPayment()) {
      this.router.navigate(['/checkout/shipment']);
      return;
    }
    if (this.cart.items().length === 0) {
      this.router.navigate(['/']);
    }
  }

  async complete(): Promise<void> {
    this.placing.set(true);
    try {
      // Final stock validation right before placing the order.
      const adjustments = await this.cart.validateStock();
      for (const adj of adjustments) {
        if (adj.type === 'removed') {
          this.toast.warning(`"${adj.name}" is out of stock and was removed from your order.`);
        } else {
          this.toast.warning(`Only ${adj.newQuantity} of "${adj.name}" left — quantity adjusted.`);
        }
      }

      if (this.cart.items().length === 0) {
        this.toast.error('All items are out of stock. Returning to the store.');
        this.state.reset();
        this.router.navigate(['/']);
        return;
      }

      const request = this.buildRequest();
      this.orderService.create(request).subscribe({
        next: (order) => {
          this.cart.clear();
          this.state.reset();
          this.router.navigate(['/order-complete', order.orderId]);
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Could not place the order. Please try again.';
          this.toast.error(message);
          this.placing.set(false);
        },
      });
    } catch {
      this.toast.error('Something went wrong validating stock. Please try again.');
      this.placing.set(false);
    }
  }

  private buildRequest(): CreateOrderRequest {
    const ship = this.draft().shipment!;
    const pay = this.draft().payment!;

    return {
      customerEmail: ship.email,
      customerFirstName: ship.firstName,
      customerLastName: ship.lastName,
      deliveryAddress: {
        fullname: `${ship.firstName} ${ship.lastName}`,
        countryRegion: ship.countryRegion,
        streetAddress: ship.streetAddress,
        unitSuiteNumber: ship.unitSuiteNumber,
        city: ship.city,
        state: ship.state,
        // Coerce to string: the ZIP input may bind as a number, but the API
        // expects a string.
        zipCode: String(ship.zipCode ?? ''),
        deliveryInstructions: ship.deliveryInstructions,
      },
      payment: {
        method: PaymentMethod.Card,
        cardholderName: pay.cardholderName,
        cardNumber: pay.cardNumber.replace(/\s/g, ''),
      },
      orderLines: this.cart.items().map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };
  }

  back(): void {
    this.router.navigate(['/checkout/payment']);
  }
}
