# LP E-Commerce — Code Challenge

A small e-commerce solution: an Angular storefront + admin site backed by a
.NET Web API and a MySQL database. All components are intended to run in Docker
containers.

| Component | Tech | Folder |
|-----------|------|--------|
| Web App / UI | Angular 21 (standalone components, signals) | [`lp-ecommerce/`](lp-ecommerce) |
| Backend API | .NET (layered, repository pattern) + EF Core | [`ecommerce-api/`](ecommerce-api) |
| Datastore | MySQL | (via EF Core migrations) |

See each project's own README for build/run details:
- [Backend README](ecommerce-api/README.md)
- [Frontend README](lp-ecommerce/README.md)

---

## Scope & business rules

The challenge requirements are intentionally open. To keep the solution small,
the following rules and decisions were defined. (The sample product CSV was
downloaded on **June 14th, 2026**.)

### Products & inventory
- **SKU is unique** and validated as such.
- **Stock** is an integer held as a single count at the product level (no
  inventory-movement history in scope).
- **Prices are USD only**, but the model carries a `Currency` field to allow
  other currencies later.
- **Categories** are a simple free-text field on the product (no separate
  catalog). A distinct list is exposed for the storefront's category filter.
- **Free products are allowed**: a price of `0.00` is valid. The literal word
  `free` in the CSV is **rejected** with a message asking the user to replace it
  with `0.00`.

### Batch product upload (CSV)
- Expected columns: `name` (required), `sku` (required), `description`
  (optional), `category` (required), `price` (required), `stock`
  (required, integer ≥ 0), `weight_kg` (required, decimal ≥ 0).
- File size is limited (large-file background processing is out of scope).
- **All-or-nothing**: if any row is invalid, nothing is imported and every
  problem row is reported so the user can fix and re-upload. Fully-blank lines
  are skipped.
- **Price cleaning**: a leading `$` is stripped (e.g. `$29.99` → `29.99`).
  Thousands separators are intentionally not handled.
- **Duplicate SKUs**:
  - If the SKU already exists in the DB, its stock is increased by the values in
    the file (with a message to the user).
  - If the SKU is new but repeated within the file, the product is created from
    the first occurrence and stock is accumulated across the repeats.

### Orders & customers
- A **minimal customer** is captured to place and look up orders; the customer
  **email is the unique identifier**. Customer-profile management is out of scope,
  so the **delivery address is captured with each order**.
- **Fake payment**: card details are collected in a form but never validated
  against a real gateway. The API only ever stores **safe metadata** — card
  brand, last 4 digits, cardholder name, amount, a generated transaction
  reference, and a timestamp. Full card number, CVV, and expiry are **never
  stored**. The fake gateway always approves.
- Shipment cost is not calculated (out of scope).
- A simple email notification to the customer is assumed (not a focus).
- **Order status**: `Open` (1), `Cancelled` (2), `Delivered` (3). The
  order id is the identifier shared with the customer. Customers can place and
  look up orders but **cannot cancel or edit** them.

### Authentication
- A single **admin user** (username + password) guards the admin pages and the
  product/order management endpoints.
- The admin password is stored as a **BCrypt hash**, verified on login; a **JWT**
  is issued and required by admin endpoints.
- No customer login: customers look up an order with their email + order id.

### Internationalization
- The demo is English-only, but the UI is built to allow future translations.

---

## UI modules

### Customer storefront (public)
- **Product list** — main page; live search by **product name and SKU**
  (transparent to the customer), a **category dropdown** (with an "All" =
  no-filter option), and **infinite scroll** (no page numbers).
- **Product detail** — image, category, name, description, SKU, weight; quantity
  selector capped to available stock; "Out of stock" disables add-to-cart.
- **Cart** — stored in the browser's local storage (not per-user on the server);
  shown in a slide-out pane. Before checkout, stock is re-validated: over-stock
  quantities are reduced and out-of-stock items removed, with the customer
  notified; if the cart empties, checkout stops.
- **Checkout flow** — Shipment (captures email + email confirmation and the
  delivery address; country is a free-text field) → fake Payment form → Order
  summary → Order complete (shows the order number). The search bar is hidden
  during checkout, and the logo returns to the main product page. The cart is
  emptied after a completed order. Card number, expiry, and ZIP use input masks;
  CVV is a hidden (password) field. Card masks support Visa/Mastercard (16-digit)
  and **Amex (15-digit)**.
- **Service offline** — if the API can't be reached, the customer is redirected
  to a "service currently offline" page.

### Admin site (requires admin login)
- **Products** — list (id, name, price, current stock) with in-memory column
  sorting; edit any field except id/SKU/status; "delete" deactivates the product
  (soft delete — hidden from the storefront and the admin list); CSV batch upload
  with a confirm step and a success/warning/error message area.
- **Orders** — list (id, placed date, total, customer name) with in-memory
  filters by **status (defaults to Open / not-yet-sent)**, id, customer name, and
  placed date; order detail shows full order info and lets the admin mark an
  order **Delivered**, capturing shipping service + tracking number.

---

## API endpoints (summary)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/login` | Public | Admin login → JWT |
| GET | `/api/products` | Public | Paged list + filters (name, category, sku) |
| GET | `/api/products/categories` | Public | Distinct active categories |
| GET | `/api/products/{id}` | Public | Single product |
| POST | `/api/products` | Admin | Create (unique-SKU validation) |
| PUT | `/api/products/{id}` | Admin | Update (not SKU/status) |
| DELETE | `/api/products/{id}` | Admin | Deactivate (soft delete) |
| POST | `/api/products/batch-upload` | Admin | CSV upload |
| POST | `/api/orders` | Public | Create order (+ fake payment) |
| GET | `/api/orders` | Admin | Paged list + filters |
| GET | `/api/orders/{id}` | Admin | Single order |
| GET | `/api/orders/validate` | Public | Check order exists by id + email |
| PATCH | `/api/orders/{id}/status` | Admin | Update status (+ shipping when Delivered) |

---

## Running locally

1. **Database** — a MySQL instance reachable on `localhost:3306` with a database
   and user (see [backend README](ecommerce-api/README.md) for the connection
   string and secrets).
2. **Backend** — from `ecommerce-api`, run the API (defaults to
   `http://localhost:5048`); EF Core migrations are applied on startup.
3. **Frontend** — from `lp-ecommerce`, run `npx ng serve` (serves
   `http://localhost:4200`). The API's CORS already allows that origin, and the
   API base URL is configured in `src/environments/environment.ts`.
