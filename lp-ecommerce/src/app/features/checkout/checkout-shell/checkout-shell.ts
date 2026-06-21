import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { StorefrontUiService } from '../../../core/services/storefront-ui.service';

@Component({
  selector: 'app-checkout-shell',
  imports: [RouterOutlet],
  templateUrl: './checkout-shell.html',
  styleUrl: './checkout-shell.css',
})
export class CheckoutShell implements OnDestroy {
  private readonly router = inject(Router);
  private readonly ui = inject(StorefrontUiService);
  readonly cart = inject(CartService);

  private sub: Subscription;
  readonly currentStep = signal(this.stepFromUrl(this.router.url));

  readonly steps = [
    { key: 'shipment', label: 'Shipment' },
    { key: 'payment', label: 'Payment' },
    { key: 'summary', label: 'Confirm' },
  ];

  readonly activeIndex = computed(() =>
    this.steps.findIndex((s) => s.key === this.currentStep()),
  );

  constructor() {
    this.ui.setShowSearch(false);
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentStep.set(this.stepFromUrl(e.urlAfterRedirects)));
  }
  
  private stepFromUrl(url: string): string {
    if (url.includes('payment')) return 'payment';
    if (url.includes('summary')) return 'summary';
    return 'shipment';
  }

  ngOnDestroy(): void {
    this.ui.setShowSearch(true);
    this.sub.unsubscribe();
  }
}
