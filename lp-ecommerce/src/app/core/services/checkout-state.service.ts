import { Injectable, signal } from '@angular/core';
import { CheckoutDraft } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  private readonly _draft = signal<CheckoutDraft>({});
  readonly draft = this._draft.asReadonly();

  setShipment(shipment: CheckoutDraft['shipment']): void {
    this._draft.update((d) => ({ ...d, shipment }));
  }

  setPayment(payment: CheckoutDraft['payment']): void {
    this._draft.update((d) => ({ ...d, payment }));
  }

  reset(): void {
    this._draft.set({});
  }

  hasShipment(): boolean {
    return !!this._draft().shipment;
  }

  hasPayment(): boolean {
    return !!this._draft().payment;
  }
}
