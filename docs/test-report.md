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

*(Test execution results will be recorded here as each module is developed and tested across Days 2–13).*
