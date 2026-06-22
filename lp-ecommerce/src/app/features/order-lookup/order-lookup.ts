import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerOrderView, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-lookup',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './order-lookup.html',
  styleUrl: './order-lookup.css',
})
export class OrderLookup {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);

  readonly OrderStatus = OrderStatus;

  readonly order = signal<CustomerOrderView | null>(null);
  readonly searching = signal(false);
  readonly notFound = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    orderId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
  });

  search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.searching.set(true);
    this.notFound.set(false);
    this.order.set(null);

    this.orderService.lookup(Number(v.orderId), v.email!.trim()).subscribe({
      next: (o) => {
        this.order.set(o);
        this.searching.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.searching.set(false);
      },
    });
  }

  statusLabel(status: OrderStatus): string {
    return OrderStatus[status];
  }
}
