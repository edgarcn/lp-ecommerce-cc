import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderDto, OrderStatus } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-admin-order-list',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './admin-order-list.html',
  styleUrl: './admin-order-list.css',
})
export class AdminOrderList {
  private readonly orderService = inject(OrderService);

  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly orders = signal<OrderDto[]>([]);

  // Filters (applied in memory). Status defaults to Open so admins see orders
  // that still need to be sent; '' means "all statuses".
  readonly filterId = signal('');
  readonly filterName = signal('');
  readonly filterDate = signal('');
  readonly filterStatus = signal<OrderStatus | ''>(OrderStatus.Open);

  readonly statusOptions: { value: OrderStatus | ''; label: string }[] = [
    { value: OrderStatus.Open, label: 'Open (not sent)' },
    { value: OrderStatus.Delivered, label: 'Delivered' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' },
    { value: '', label: 'All' },
  ];

  readonly filtered = computed(() => {
    const id = this.filterId().trim();
    const name = this.filterName().trim().toLowerCase();
    const date = this.filterDate();
    const status = this.filterStatus();
    return this.orders().filter((o) => {
      if (status !== '' && o.orderStatus !== status) return false;
      if (id && String(o.orderId) !== id) return false;
      if (name) {
        const full = `${o.customerFirstName} ${o.customerLastName}`.toLowerCase();
        if (!full.includes(name)) return false;
      }
      if (date && o.placedDate.slice(0, 10) !== date) return false;
      return true;
    });
  });

  constructor() {
    this.orderService.list().subscribe({
      next: (res) => {
        this.orders.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.filterId.set('');
    this.filterName.set('');
    this.filterDate.set('');
    this.filterStatus.set(OrderStatus.Open);
  }

  statusLabel(status: OrderStatus): string {
    return OrderStatus[status];
  }
}
