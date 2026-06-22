import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-product-new',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-new.html',
  styleUrl: './admin-product-new.css',
})
export class AdminProductNew {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);

  readonly form = this.fb.group({
    sku: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    weightKg: [0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.productService
      .create({
        sku: v.sku!,
        name: v.name!,
        description: v.description || undefined,
        category: v.category!,
        price: v.price!,
        stock: v.stock!,
        weightKg: v.weightKg!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Product created.');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Could not create product.');
          this.saving.set(false);
        },
      });
  }
}
