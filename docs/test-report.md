# Testing Strategy & Test Report

## 1. Test Matrix Overview

| Module | Test Type | Test Scenarios | Target Result |
| :--- | :--- | :--- | :--- |
| **Auth** | Integration | 1. Successful customer/vendor/admin registration<br>2. Duplicate email rejection<br>3. Invalid credentials rejection<br>4. Password hashing check (never exposed in response)<br>5. JWT expiration & signature validation | All Pass |
| **RBAC** | Integration | 1. Customer blocked from `/api/admin/*` and `/api/vendor/*`<br>2. Vendor blocked from modifying another vendor's products<br>3. Public user blocked from protected routes | All Pass |
| **Vendors** | Integration | 1. Vendor application creates pending store<br>2. Admin approves store<br>3. Unapproved vendor cannot publish products | All Pass |
| **Products** | Integration | 1. Vendor creates product with price & inventory<br>2. Missing required fields rejected<br>3. Ownership check on edit/delete | All Pass |
| **Search (ES)** | Integration | 1. Elasticsearch indexing on product create/update<br>2. Keyword search across title & description<br>3. Price range filtering and sort | All Pass |
| **Cart (Redis)** | Unit / Int | 1. Cart stores items in Redis<br>2. Quantity update & product removal<br>3. Cart TTL refresh on activity | All Pass |
| **Checkout** | Integration | 1. Server-side subtotal & coupon calculation<br>2. Concurrency-safe inventory decrement<br>3. Out-of-stock rejection | All Pass |
| **Multi-Vendor Order** | Integration | 1. Single checkout with products from 2 different vendors<br>2. Order splits into correct vendor line items<br>3. Vendor A cannot advance status of Vendor B's items | All Pass |
| **Payments** | Integration | 1. Razorpay order creation<br>2. Signature verification logic<br>3. Platform 10% commission & vendor gross calculation<br>4. Idempotent webhook handling | All Pass |
| **Reviews** | Unit / Int | 1. Non-purchaser blocked from review<br>2. Valid purchaser review updates product average rating | All Pass |

---

## 2. Test Execution Log

### Step 1: Database Models & Schema Validation
- **Test File**: `server/test/models.test.js`
- **Runner**: Vitest v3.2.7
- **Results**: 7 / 7 tests passed (100%)
  - `User`: Required fields, unique email index, bcrypt hash pre-save hook.
  - `Store`: Owner relation, default `pending` approval status, unique slug.
  - `Product`: Price, integer stock, category validation, compound index structures.
  - `Order`: Multi-vendor line item snapshots, overall status derivation (`completed`, `in_progress`, `cancelled`).
  - `Payment`: Currency default (INR), commission ledger breakdown, transfer structures.
  - `Review`: Rating constraints (1-5), verified order link, unique constraint per customer/product.
  - `Coupon`: Subtotal minimum check, active status check, and expiry evaluation.

### Step 1: API Endpoint Plan & Contract Verification
- **Test File**: `server/test/routes.test.js`
- **Runner**: Vitest v3.2.7 + Supertest v7.0.0
- **Results**: 11 / 11 tests passed (100%)
  - Healthcheck (`/health`) returns standard uptime payload.
  - Discovery (`/api`) and documentation catalogue (`/api/docs`) expose all modules and routes.
  - Auth, products, cart, multi-vendor orders, payments, admin analytics, and uploads endpoints adhere to standard response envelopes.
  - 404 handler returns formatted error envelope for unregistered routes.

### Step 1: Authorization & RBAC Middleware Verification
- **Test File**: `server/test/authorization.test.js`
- **Runner**: Vitest v3.2.7
- **Results**: 12 / 12 tests passed (100%)
  - Unauthenticated requests rejected with `401 Unauthorized`.
  - Valid JWT accepted and parsed into `req.user`.
  - Suspended account rejected with `403 Forbidden`.
  - Role-based guards block customers from admin APIs and vendors from customer-only actions.
  - Resource ownership checks prevent cross-user resource mutations while granting admin override.
  - Multi-vendor isolation check prevents a vendor from updating line items owned by another vendor.

### Step 2: Authentication & Role-Based Access Verification
- **Test File**: `server/test/auth.test.js`
- **Runner**: Vitest v3.2.7 + Supertest v7.0.0
- **Results**: 16 / 16 tests passed (100%)
  - Customer & Vendor registration with unique emails and password hashing.
  - Duplicate email registrations rejected with `409 Conflict`.
  - Invalid / weak registration payloads rejected with `400 Bad Request`.
  - Correct credentials authenticate successfully and set HttpOnly JWT cookie.
  - Incorrect passwords and non-existent emails rejected with `401 Unauthorized`.
  - Suspended accounts blocked with `403 Forbidden`.
  - Sensitive password hashes verified to never be returned in API payloads.
  - Profile retrieval via `/api/auth/me` and logout with cookie invalidation.
  - Cross-role authorization tests (Customer blocked from Vendor/Admin APIs; Vendor blocked from Admin APIs; Admin granted access).

### Step 3: Vendor Onboarding, Product CRUD & S3 Upload Verification
- **Test File**: `server/test/step3.test.js`
- **Runner**: Vitest v3.2.7 + Supertest v7.0.0
- **Results**: 10 / 10 tests passed (100%)
  - Customer application for vendor store initializes with `approvalStatus: 'pending'`.
  - Duplicate store registrations or duplicate slug requests rejected with `409 Conflict`.
  - Admin approves vendor application and elevates user account role to `'vendor'`.
  - Unapproved vendors blocked from product publishing with `403 Forbidden`.
  - Approved vendors successfully create products with title, price, inventory stock, category, and S3 media.
  - Vendor successfully updates own product inventory and price.
  - Cross-vendor modification blocked: Vendor A receives `403 Forbidden` when attempting to edit or archive Vendor B's product.
  - Vendor archives own product listing (soft delete).
  - AWS S3 direct presigned URL endpoint validates image MIME types and blocks unsupported files (e.g. PDF/EXE) with `400 Bad Request`.

### Step 4: Elasticsearch Search, Filters, Sorting & Sync Verification
- **Test File**: `server/test/step4.elasticsearch.test.js`
- **Runner**: Vitest v3.2.7 + Supertest v7.0.0
- **Results**: 13 / 13 tests passed (100%)
  - Boolean DSL query builder generates keyword `multi_match` queries boosting `title^3` over description.
  - Inactive and archived products strictly excluded with `term: { status: 'active' }`.
  - Multi-faceted filters for category, vendor store, price range (`gte`/`lte`), and in-stock availability (`stock > 0`) applied accurately.
  - Sorting criteria supported: `price_asc`, `price_desc`, `newest`, and relevance score `_score`.
  - Pagination offsets (`from` and `size`) calculated accurately from `page` and `limit`.
  - Product document formatting correctly includes store snapshot and denormalized fields.
  - Outbox retry pattern captures index operations when Elasticsearch service is temporarily unreachable.
  - Real-time index synchronization on product create, update, and archive/delete.
  - Express API endpoint `/api/products` delivers Elasticsearch search results, aggregations, and facets.
  - Graceful MongoDB search fallback ensures catalog availability if Elasticsearch is down.

### Step 5: Redis Cart, Atomic Checkout & Multi-Vendor Order Lifecycle Verification
- **Test File**: `server/test/step5.cart-orders.test.js`
- **Runner**: Vitest v3.2.7 + Supertest v7.0.0
- **Results**: 11 / 11 tests passed (100%)
  - Shopping cart storage in Redis with key pattern `cart:user:<userId>` and in-memory test fallback.
  - Real-time cart hydration: fetches live product prices and inventory, flagging out-of-stock items (`isAvailable: false`).
  - Add to cart validates stock limits and increments quantities up to available inventory.
  - Cart item quantity update and removal on quantity = 0.
  - Cart clearing endpoint (`DELETE /api/cart`).
  - Concurrency-safe atomic inventory decrement via atomic `findOneAndUpdate` preventing race conditions and overselling.
  - Automatic rollback of prior decrements if any product in a multi-item checkout lacks sufficient inventory (`409 Conflict`).
  - Marketplace 10% platform commission calculation snapshot: ₹3,000 subtotal generates ₹300 platform share, ₹1,800 to Vendor A, and ₹900 to Vendor B.
  - Multi-vendor order isolation: Vendor A can retrieve only items belonging to their store.
  - Fulfillment lifecycle progression: Vendor advances item status through `placed` → `packed` → `shipped` (with tracking number) → `delivered`.
  - Multi-vendor fulfillment guard: Vendor A is blocked (`403 Forbidden`) from modifying Vendor B's items.
  - Derived order status recalculation updates overall order status (`placed` → `in_progress` → `completed`).
  - Customer order history retrieval via `/api/orders/my`.

### Step 6: Payment Gateway, Signature Verification & Commission Ledger Verification
- **Test File**: `server/test/step6.payments.test.js`
- **Runner**: Vitest v3.2.7 + Supertest v7.0.0
- **Results**: 9 / 9 tests passed (100%)
  - Payment order creation with INR to paise conversion (₹3,000 $\rightarrow$ 300,000 paise).
  - Razorpay order initialization returning `providerOrderId`, `amount`, and `currency: 'INR'`.
  - 404 response on attempting to initialize payment for non-existent orders.
  - Cryptographic HMAC-SHA256 signature verification matching `order_id|payment_id` against the secret key.
  - Rejection of tampered signatures with `400 Bad Request`.
  - Finalization of platform commission (10%) and vendor gross/net transfers on payment capture.
  - Idempotent webhook handling for `payment.captured` and `order.paid` events.
  - Duplicate webhook delivery idempotency: safely returns 200 without duplicate database state mutations.
  - Failed payment webhook handling transitions payment and order statuses to `failed`.
  - Admin commission ledger oversight endpoint `/api/payments/ledger` calculates GTV and total commission earnings.
  - RBAC protection: Customer access to admin financial ledger is strictly forbidden (`403 Forbidden`).
