import { Component, input } from '@angular/core';

/**
 * Generic product image. Dynamic per-product image storage is out of scope for
 * the demo, so we render a shared placeholder asset. The 'detail' variant uses
 * a larger artwork for the product detail view; everything else uses the list image.
 */
@Component({
  selector: 'app-product-image',
  template: `
    <img
      class="thumb"
      [src]="src()"
      [alt]="name()"
      [style.--size]="size() ? size() + 'px' : null"
    />
  `,
  styles: [
    `
      .thumb {
        width: var(--size, 100%);
        height: var(--size, 100%);
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: var(--radius-sm);
        display: block;
        background: var(--color-surface-alt);
      }
    `,
  ],
})
export class ProductImage {
  readonly name = input.required<string>();
  readonly seed = input<number>(0);
  readonly size = input<number | null>(null);
  readonly variant = input<'list' | 'detail'>('list');

  src(): string {
    return this.variant() === 'detail'
      ? 'assets/images/generic-product-detail.png'
      : 'assets/images/generic-product.png';
  }
}
