import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { StorefrontUiService } from './core/services/storefront-ui.service';
import { CartPane } from './shared/components/cart-pane/cart-pane';
import { Header } from './shared/components/header/header';
import { ToastHost } from './shared/components/toast-host/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CartPane, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly ui = inject(StorefrontUiService);
  private readonly router = inject(Router);

  // Customer chrome (header + cart) is hidden on admin routes (own shell) and
  // on the full-screen offline page.
  readonly showCustomerChrome = signal(this.isCustomerRoute(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.showCustomerChrome.set(this.isCustomerRoute(e.urlAfterRedirects)));
  }

  private isCustomerRoute(url: string): boolean {
    return !url.startsWith('/admin') && !url.startsWith('/offline');
  }
}
