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
