import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';

function emailsMatch(group: AbstractControl): ValidationErrors | null {
  const email = group.get('email')?.value;
  const confirm = group.get('emailConfirm')?.value;
  return email && confirm && email !== confirm ? { emailMismatch: true } : null;
}

@Component({
  selector: 'app-shipment',
  imports: [ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './shipment.html',
  styleUrl: './shipment.css',
})
export class Shipment {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly state = inject(CheckoutStateService);
  private readonly cart = inject(CartService);

  readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      emailConfirm: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      countryRegion: ['', Validators.required],
      streetAddress: ['', Validators.required],
      unitSuiteNumber: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      deliveryInstructions: [''],
    },
    { validators: emailsMatch },
  );

  constructor() {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/']);
      return;
    }
    const existing = this.state.draft().shipment;
    if (existing) {
      this.form.patchValue({ ...existing, emailConfirm: existing.email });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.state.setShipment({
      email: v.email!,
      firstName: v.firstName!,
      lastName: v.lastName!,
      countryRegion: v.countryRegion!,
      streetAddress: v.streetAddress!,
      unitSuiteNumber: v.unitSuiteNumber || undefined,
      city: v.city!,
      state: v.state!,
      zipCode: v.zipCode!,
      deliveryInstructions: v.deliveryInstructions || undefined,
    });
    this.router.navigate(['/checkout/payment']);
  }
}
