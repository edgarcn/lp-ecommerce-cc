import { Component, input } from '@angular/core';

/**
 * Placeholder product image. Dynamic image storage is out of scope for the demo,
 * so we render a deterministic colored tile with the product initial.
 */
@Component({
  selector: 'app-product-image',
  template: `
    <div class="thumb" [style.background]="bg()" [style.--size]="size() + 'px'">
      <span>{{ initial() }}</span>
    </div>
  `,
  styles: [
    `
      .thumb {
        width: var(--size, 100%);
        height: var(--size, 100%);
        aspect-ratio: 1 / 1;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: var(--font-heading);
        font-size: calc(var(--size, 80px) * 0.4);
        font-weight: 700;
        user-select: none;
      }
    `,
  ],
})
export class ProductImage {
  readonly name = input.required<string>();
  readonly seed = input<number>(0);
  readonly size = input<number | null>(null);

  private readonly palette = ['#6d28d9', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

  initial(): string {
    return (this.name()?.trim()[0] ?? '?').toUpperCase();
  }

  bg(): string {
    const idx = (this.seed() || this.name().length) % this.palette.length;
    return `linear-gradient(135deg, ${this.palette[idx]}, ${this.palette[(idx + 2) % this.palette.length]})`;
  }
}
