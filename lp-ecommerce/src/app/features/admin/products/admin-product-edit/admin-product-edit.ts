import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-product-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-edit.html',
  styleUrl: './admin-product-edit.css',
})
export class AdminProductEdit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  private readonly productId = Number(this.route.snapshot.paramMap.get('id'));

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly saving = signal(false);
  readonly deactivating = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    weightKg: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.productService.getById(this.productId).subscribe({
      next: (p) => {
        this.product.set(p);
        this.form.patchValue({
          name: p.name,
          description: p.description ?? '',
          category: p.category,
          price: p.price,
          stock: p.currentStock,
          weightKg: p.weightKg,
        });
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.productService
      .update(this.productId, {
        name: v.name!,
        description: v.description || undefined,
        category: v.category!,
        price: v.price!,
        stock: v.stock!,
        weightKg: v.weightKg!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Product updated.');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Could not update product.');
          this.saving.set(false);
        },
      });
  }

  deactivate(): void {
    const p = this.product();
    if (!p) return;
    if (!confirm(`Deactivate "${p.name}"? It will be removed from the storefront.`)) return;
    this.deactivating.set(true);
    this.productService.deactivate(this.productId).subscribe({
      next: () => {
        this.toast.success(`"${p.name}" deactivated.`);
        this.router.navigate(['/admin/products']);
      },
      error: () => {
        this.toast.error('Could not deactivate product.');
        this.deactivating.set(false);
      },
    });
  }
}
