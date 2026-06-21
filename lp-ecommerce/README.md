# LP E-Commerce — Frontend

Angular 21 storefront + admin site (standalone components, signals). See the
[solution README](../README.md) for the full business rules.

## Overview
- **Customer storefront** (public): product list with name/SKU search, category
  dropdown, and infinite scroll; product detail; local-storage cart with
  pre-checkout stock revalidation; 3-step checkout (shipment → fake payment →
  summary) with masked card/expiry/ZIP inputs (Visa/Mastercard + Amex) and a
  hidden CVV; order-complete screen; and an offline page shown when the API is
  unreachable.
- **Admin site** (JWT-guarded `/admin`): login, product list (sortable) + edit +
  deactivate + CSV batch upload, and order list (filterable, status defaults to
  Open) + detail with mark-as-delivered.

## Configuration
- API base URL: `src/environments/environment.ts` (defaults to
  `http://localhost:5048/api`).
- Admin login uses the credentials configured in the backend.

## Quick start
```bash
npx ng serve      # http://localhost:4200
```
The backend API must be running (see [backend README](../ecommerce-api/README.md)).

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.11.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
