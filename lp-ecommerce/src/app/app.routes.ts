import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';

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
  {
    path: 'offline',
    loadComponent: () => import('./features/offline/offline').then((m) => m.Offline),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/admin-product-list/admin-product-list').then(
            (m) => m.AdminProductList,
          ),
      },
      {
        path: 'products/batch',
        loadComponent: () =>
          import('./features/admin/products/admin-batch-upload/admin-batch-upload').then(
            (m) => m.AdminBatchUpload,
          ),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/admin/products/admin-product-edit/admin-product-edit').then(
            (m) => m.AdminProductEdit,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/admin-order-list/admin-order-list').then(
            (m) => m.AdminOrderList,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/admin/orders/admin-order-detail/admin-order-detail').then(
            (m) => m.AdminOrderDetail,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
