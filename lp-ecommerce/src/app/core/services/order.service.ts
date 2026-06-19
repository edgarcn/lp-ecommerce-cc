import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderRequest, OrderDto, OrderStatus } from '../models/order.model';
import { PagedResult } from '../models/product.model';

export interface ShippingInfoRequest {
  shippingServiceName: string;
  trackingNumber: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/orders`;

  create(request: CreateOrderRequest): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.baseUrl, request);
  }

  list(page = 1, pageSize = 100): Observable<PagedResult<OrderDto>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<PagedResult<OrderDto>>(this.baseUrl, { params });
  }

  getById(orderId: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.baseUrl}/${orderId}`);
  }

  updateStatus(
    orderId: number,
    orderStatus: OrderStatus,
    shippingInfo?: ShippingInfoRequest,
  ): Observable<OrderDto> {
    return this.http.patch<OrderDto>(`${this.baseUrl}/${orderId}/status`, {
      orderStatus,
      shippingInfo: shippingInfo ?? null,
    });
  }
}
