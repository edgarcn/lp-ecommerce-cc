import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/products/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout-shell/checkout-shell').then((m) => m.CheckoutShell),
    children: [
      { path: '', redirectTo: 'shipment', pathMatch: 'full' },
      {
        path: 'shipment',
        loadComponent: () =>
          import('./features/checkout/shipment/shipment').then((m) => m.Shipment),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./features/checkout/payment/payment').then((m) => m.Payment),
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./features/checkout/summary/summary').then((m) => m.Summary),
      },
    ],
  },
  {
    path: 'order-complete/:id',
    loadComponent: () =>
      import('./features/checkout/order-complete/order-complete').then((m) => m.OrderComplete),
  },
  { path: '**', redirectTo: '' },
];
