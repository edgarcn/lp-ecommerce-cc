import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { StorefrontUiService } from '../../../core/services/storefront-ui.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';

const PAGE_SIZE = 12;
const PREFETCH_PX = 300;

@Component({
  selector: 'app-product-list',
  imports: [ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements AfterViewInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly ui = inject(StorefrontUiService);
  private readonly toast = inject(ToastService);
  private readonly zone = inject(NgZone);

  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;
  private readonly onScroll = () => this.checkSentinel();

  readonly pageTitle = computed(() => this.ui.search().category || 'All Products');

  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);

  private page = 1;
  private nameTotalPages = 1;
  private term = '';
  private category = '';

  constructor() {
    this.ui.setShowSearch(true);
    this.loadCategories();

    effect(() => {
      const criteria = this.ui.search();
      untracked(() => this.startSearch(criteria.term, criteria.category));
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });

    const el = this.sentinel()?.nativeElement;
    if (el && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) this.zone.run(() => this.loadMore());
        },
        { rootMargin: `${PREFETCH_PX}px` },
      );
      this.observer.observe(el);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => this.ui.setCategories(cats),
      error: () => this.ui.setCategories([]),
    });
  }

  private startSearch(term: string, category: string): void {
    this.term = term;
    this.category = category;
    this.page = 1;
    this.nameTotalPages = 1;
    this.products.set([]);
    this.total.set(0);
    this.loading.set(true);

    this.productService
      .list({ name: term || undefined, category: category || undefined, page: 1, pageSize: PAGE_SIZE })
      .subscribe({
        next: (byName) => {
          this.nameTotalPages = byName.totalPages;
          if (term) {
            this.productService
              .list({ sku: term, category: category || undefined, page: 1, pageSize: PAGE_SIZE })
              .subscribe({
                next: (bySku) => this.setFirstPage(byName.items, bySku.items, byName.totalCount),
                error: () => this.setFirstPage(byName.items, [], byName.totalCount),
              });
          } else {
            this.setFirstPage(byName.items, [], byName.totalCount);
          }
        },
        error: () => {
          this.toast.error('Could not load products. Is the API running?');
          this.products.set([]);
          this.loading.set(false);
        },
      });
  }

  private setFirstPage(nameItems: Product[], skuItems: Product[], totalCount: number): void {
    const merged = [...nameItems];
    for (const p of skuItems) {
      if (!merged.some((m) => m.productId === p.productId)) merged.push(p);
    }
    this.products.set(merged);
    this.total.set(totalCount);
    this.loading.set(false);
    this.fillIfNeeded();
  }

  private loadMore(): void {
    if (this.loading() || this.loadingMore() || this.page >= this.nameTotalPages) return;
    this.loadingMore.set(true);
    const nextPage = this.page + 1;

    this.productService
      .list({
        name: this.term || undefined,
        category: this.category || undefined,
        page: nextPage,
        pageSize: PAGE_SIZE,
      })
      .subscribe({
        next: (res) => {
          this.page = nextPage;
          const appended = [...this.products()];
          for (const p of res.items) {
            if (!appended.some((m) => m.productId === p.productId)) appended.push(p);
          }
          this.products.set(appended);
          this.loadingMore.set(false);
          this.fillIfNeeded();
        },
        error: () => this.loadingMore.set(false),
      });
  }

  private checkSentinel(): void {
    if (this.page >= this.nameTotalPages || this.loading() || this.loadingMore()) return;
    const el = this.sentinel()?.nativeElement;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top <= window.innerHeight + PREFETCH_PX) {
      this.zone.run(() => this.loadMore());
    }
  }

  private fillIfNeeded(): void {
    if (this.page < this.nameTotalPages) {
      setTimeout(() => this.checkSentinel(), 0);
    }
  }
}
