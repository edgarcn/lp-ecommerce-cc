import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';

@Component({
  selector: 'app-payment',
  imports: [ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly state = inject(CheckoutStateService);

  readonly form = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{13,23}$/)]],
    cardholderName: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  // Live preview values
  readonly cardNumber = signal('');
  readonly cardholderName = signal('');
  readonly expiry = signal('');

  readonly last4 = computed(() => {
    const digits = this.cardNumber().replace(/\D/g, '');
    return digits.length >= 4 ? digits.slice(-4) : digits.padEnd(4, '•');
  });

  constructor() {
    if (!this.state.hasShipment()) {
      this.router.navigate(['/checkout/shipment']);
      return;
    }
    const existing = this.state.draft().payment;
    if (existing) {
      this.form.patchValue({
        cardNumber: existing.cardNumber,
        cardholderName: existing.cardholderName,
        expiry: existing.expiry,
      });
      this.cardNumber.set(existing.cardNumber);
      this.cardholderName.set(existing.cardholderName);
      this.expiry.set(existing.expiry);
    }

    this.form.get('cardNumber')!.valueChanges.subscribe((v) => this.cardNumber.set(v ?? ''));
    this.form.get('cardholderName')!.valueChanges.subscribe((v) => this.cardholderName.set(v ?? ''));
    this.form.get('expiry')!.valueChanges.subscribe((v) => this.expiry.set(v ?? ''));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    // CVV is intentionally NOT stored, even in the in-memory draft.
    this.state.setPayment({
      cardNumber: v.cardNumber!,
      cardholderName: v.cardholderName!,
      expiry: v.expiry!,
    });
    this.router.navigate(['/checkout/summary']);
  }

  back(): void {
    this.router.navigate(['/checkout/shipment']);
  }
}
