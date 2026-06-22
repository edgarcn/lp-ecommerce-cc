import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderDto, OrderStatus } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-order-detail',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-order-detail.html',
  styleUrl: './admin-order-detail.css',
})
export class AdminOrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly orderId = Number(this.route.snapshot.paramMap.get('id'));

  readonly order = signal<OrderDto | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly saving = signal(false);
  readonly cancelling = signal(false);
  readonly showCancelDialog = signal(false);

  readonly OrderStatus = OrderStatus;

  readonly shipForm = this.fb.group({
    shippingServiceName: ['', Validators.required],
    trackingNumber: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.orderService.getById(this.orderId).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  markDelivered(): void {
    if (this.shipForm.invalid) {
      this.shipForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.shipForm.getRawValue();
    this.orderService
      .updateStatus(this.orderId, OrderStatus.Delivered, {
        shippingServiceName: v.shippingServiceName!,
        trackingNumber: v.trackingNumber!,
      })
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.toast.success('Order marked as delivered.');
          this.saving.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Could not update the order.');
          this.saving.set(false);
        },
      });
  }

  requestCancel(): void {
    if (!this.order()) return;
    this.showCancelDialog.set(true);
  }

  dismissCancel(): void {
    this.showCancelDialog.set(false);
  }

  confirmCancel(): void {
    const o = this.order();
    if (!o) return;
    this.showCancelDialog.set(false);
    this.cancelling.set(true);
    this.orderService.updateStatus(this.orderId, OrderStatus.Cancelled).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.toast.success('Order cancelled. In-stock items were returned to inventory.');
        this.cancelling.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Could not cancel the order.');
        this.cancelling.set(false);
      },
    });
  }

  statusLabel(status: OrderStatus): string {
    return OrderStatus[status];
  }
}
