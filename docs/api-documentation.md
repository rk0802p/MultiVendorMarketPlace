# Multi-Vendor E-Commerce Marketplace — API Endpoint Documentation

## 1. Global API Conventions

- **Base URL**: `http://localhost:5000/api`
- **Default Format**: `application/json`
- **Authentication**: JWT token sent via `Authorization: Bearer <token>` header or `jwt` HttpOnly cookie.
- **Error Standard**: RFC 7807 compatible JSON structure.

### Standard Success Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific field error 1", "Specific field error 2"]
}
```

---

## 2. API Endpoints Inventory & Contracts

### 2.1 Authentication Module (`/api/auth`)

#### `POST /api/auth/register`
Create a customer or vendor account.
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Raj Patel",
  "email": "raj@example.com",
  "password": "Password123!"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "671df9a01a34b9...",
      "name": "Raj Patel",
      "email": "raj@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### `POST /api/auth/login`
Authenticate existing user and issue JWT.
- **Access**: Public
- **Request Body**:
```json
{
  "email": "raj@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "User authenticated successfully",
  "data": {
    "user": {
      "id": "671df9a01a34b9...",
      "name": "Raj Patel",
      "email": "raj@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### `GET /api/auth/me`
Retrieve currently authenticated profile.
- **Access**: Private (Customer, Vendor, Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "671df9a01a34b9...",
      "name": "Raj Patel",
      "email": "raj@example.com",
      "role": "customer"
    }
  }
}
```

#### `POST /api/auth/logout`
Clear authentication cookie / session.
- **Access**: Private
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### 2.2 Vendor Module (`/api/vendors`)

#### `POST /api/vendors/apply`
Submit store registration application.
- **Access**: Private (Role: Customer)
- **Request Body**:
```json
{
  "name": "Apex Electronics",
  "slug": "apex-electronics",
  "description": "Authorized retailer of premium audio & computer accessories"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Vendor application submitted for review",
  "data": {
    "store": {
      "id": "671dfa8b...",
      "name": "Apex Electronics",
      "slug": "apex-electronics",
      "approvalStatus": "pending"
    }
  }
}
```

#### `GET /api/vendors/me`
Retrieve authenticated vendor's store details.
- **Access**: Private (Role: Vendor)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Vendor store profile retrieved",
  "data": {
    "store": {
      "id": "671dfa8b...",
      "name": "Apex Electronics",
      "slug": "apex-electronics",
      "approvalStatus": "approved",
      "paymentAccountId": "acc_rzp_mock123"
    }
  }
}
```

#### `PATCH /api/vendors/me`
Update own store profile (description, logo, banner).
- **Access**: Private (Role: Vendor)

---

### 2.3 Products Module (`/api/products`)

#### `GET /api/products`
Full-text search, multi-faceted filtering, sorting, and pagination (via Elasticsearch).
- **Access**: Public
- **Query Parameters**:
  - `q`: Search keyword (searches `title` and `description`)
  - `category`: Category string
  - `minPrice`: Number
  - `maxPrice`: Number
  - `storeId`: Filter by specific store
  - `sort`: `price_asc`, `price_desc`, `newest`, `relevance`
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 12)
- **Example Request**:
  `GET /api/products?q=wireless+headphones&category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc&page=1&limit=12`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "products": [
      {
        "id": "671dfb11...",
        "title": "Wireless Noise Cancelling Headphones",
        "slug": "wireless-noise-cancelling-headphones",
        "price": 3499,
        "stock": 45,
        "category": "Electronics",
        "images": ["https://s3.ap-south-1.amazonaws.com/..."],
        "store": {
          "id": "671dfa8b...",
          "name": "Apex Electronics"
        },
        "averageRating": 4.8,
        "reviewCount": 19
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### `GET /api/products/:id`
Retrieve single product details.
- **Access**: Public

#### `POST /api/products`
Create a new product listing.
- **Access**: Private (Role: Approved Vendor)
- **Request Body**:
```json
{
  "title": "Ergonomic Mechanical Keyboard",
  "slug": "ergonomic-mechanical-keyboard",
  "description": "Tactile switch RGB mechanical keyboard with wrist rest.",
  "category": "Electronics",
  "price": 2499,
  "stock": 35,
  "images": [
    "https://s3.ap-south-1.amazonaws.com/multivendor-marketplace-images/keyboard1.jpg"
  ]
}
```

#### `PATCH /api/products/:id`
Update an existing product listing (verifies vendor ownership).
- **Access**: Private (Role: Vendor Owner)

#### `DELETE /api/products/:id`
Archive/deactivate product (soft deletion).
- **Access**: Private (Role: Vendor Owner)

---

### 2.4 Media Uploads Module (`/api/uploads`)

#### `POST /api/uploads/presigned-url`
Generate secure AWS S3 presigned upload URL for direct client-side upload.
- **Access**: Private (Vendor / Admin)
- **Request Body**:
```json
{
  "fileName": "keyboard-front.png",
  "fileType": "image/png"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Presigned upload URL generated",
  "data": {
    "uploadUrl": "https://bucket.s3.ap-south-1.amazonaws.com/uploads/169833-keyboard.png?...",
    "fileUrl": "https://bucket.s3.ap-south-1.amazonaws.com/uploads/169833-keyboard.png",
    "expiresIn": 300
  }
}
```

---

### 2.5 Shopping Cart Module (`/api/cart`)
Cart persistence backed by Redis (`cart:user:<userId>`) with fresh price checks against MongoDB.

#### `GET /api/cart`
Retrieve active cart with live item availability and calculated totals.
- **Access**: Private (Role: Customer)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cart retrieved",
  "data": {
    "items": [
      {
        "productId": "671dfb11...",
        "title": "Wireless Headphones",
        "price": 3499,
        "quantity": 2,
        "subtotal": 6998,
        "store": {
          "id": "671dfa8b...",
          "name": "Apex Electronics"
        }
      }
    ],
    "subtotal": 6998,
    "itemCount": 2
  }
}
```

#### `POST /api/cart/items`
Add item to Redis cart.
- **Access**: Private (Role: Customer)
- **Request Body**: `{ "productId": "671dfb11...", "quantity": 1 }`

#### `PATCH /api/cart/items/:productId`
Update item quantity in cart.
- **Access**: Private (Role: Customer)
- **Request Body**: `{ "quantity": 3 }`

#### `DELETE /api/cart/items/:productId`
Remove item from cart.
- **Access**: Private (Role: Customer)

#### `DELETE /api/cart`
Clear customer's active cart.
- **Access**: Private (Role: Customer)

---

### 2.6 Orders & Multi-Vendor Lifecycle Module (`/api/orders`)

#### `POST /api/orders`
Validate cart, verify stock, apply coupon, create order with vendor item snapshots.
- **Access**: Private (Role: Customer)
- **Request Body**:
```json
{
  "shippingAddress": {
    "fullName": "Raj Patel",
    "addressLine1": "101 High Street",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India",
    "phone": "9876543210"
  },
  "couponCode": "WELCOME10"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "671dfc89...",
    "orderNumber": "ORD-20261026-8812",
    "totals": {
      "subtotal": 3000,
      "discount": 300,
      "shipping": 0,
      "tax": 0,
      "grandTotal": 2700
    },
    "paymentStatus": "pending",
    "overallStatus": "placed"
  }
}
```

#### `GET /api/orders/my`
Customer order history.
- **Access**: Private (Role: Customer)

#### `GET /api/orders/:id`
Order details with item fulfillment progress.
- **Access**: Private (Customer Owner / Admin / Relevant Vendor)

#### `GET /api/orders/:id/invoice`
Stream generated PDF invoice.
- **Access**: Private (Customer Owner / Admin)

#### `GET /api/orders/vendor/items`
Retrieve line items assigned to the authenticated vendor across orders.
- **Access**: Private (Role: Vendor)

#### `PATCH /api/orders/vendor/:orderId/items/:itemId/status`
Advance fulfillment status of an owned order item.
- **Access**: Private (Role: Vendor Owner of Item)
- **Request Body**:
```json
{
  "status": "shipped",
  "trackingNumber": "FEDEX-IND-92812"
}
```
- **Valid State Transitions**:
  `placed` → `packed` → `shipped` → `delivered`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order item fulfillment status updated",
  "data": {
    "orderId": "671dfc89...",
    "itemId": "item_123",
    "fulfillmentStatus": "shipped"
  }
}
```

---

### 2.7 Payment Processing & Commission Splits (`/api/payments`)

#### `POST /api/payments/create-order`
Initialize test payment provider order (Razorpay).
- **Access**: Private (Role: Customer)
- **Request Body**: `{ "orderId": "671dfc89..." }`
- **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "providerOrderId": "order_rzp_mock123",
    "amount": 270000,
    "currency": "INR",
    "keyId": "rzp_test_xxxx"
  }
}
```

#### `POST /api/payments/verify`
Verify HMAC-SHA256 signature and record the platform commission & vendor shares ledger.
- **Access**: Private (Role: Customer)
- **Request Body**:
```json
{
  "orderId": "671dfc89...",
  "razorpayOrderId": "order_rzp_mock123",
  "razorpayPaymentId": "pay_rzp_mock456",
  "razorpaySignature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payment verified and commission recorded",
  "data": {
    "orderId": "671dfc89...",
    "paymentStatus": "paid",
    "commission": {
      "platformCommissionRate": 10,
      "totalCommissionAmount": 270,
      "transfers": [
        {
          "vendorId": "671dfa8b...",
          "storeId": "671dfa8b...",
          "grossAmount": 1800,
          "commissionAmount": 180,
          "netPayout": 1620,
          "transferStatus": "pending"
        },
        {
          "vendorId": "671dfb99...",
          "storeId": "671dfb99...",
          "grossAmount": 900,
          "commissionAmount": 90,
          "netPayout": 810,
          "transferStatus": "pending"
        }
      ]
    }
  }
}
```

#### `POST /api/payments/webhook`
Idempotent webhook handler verifying provider raw body signature.
- **Access**: Public (Signature-verified)

---

### 2.8 Customer Reviews (`/api/reviews`)

#### `GET /api/reviews/product/:productId`
List reviews for a product.
- **Access**: Public

#### `POST /api/reviews/product/:productId`
Submit verified-purchase review.
- **Access**: Private (Customer with verified purchase)
- **Request Body**:
```json
{
  "orderId": "671dfc89...",
  "rating": 5,
  "comment": "Exceptional build quality and fast delivery!"
}
```

---

### 2.9 Promotions & Coupons (`/api/coupons`)

#### `POST /api/coupons/validate`
Validate promo code for customer cart.
- **Access**: Private (Customer)
- **Request Body**: `{ "code": "SAVE10", "cartSubtotal": 3000 }`

#### `POST /api/coupons`
Create coupon code.
- **Access**: Private (Admin)
- **Request Body**:
```json
{
  "code": "DIWALI500",
  "type": "fixed",
  "value": 500,
  "minCartValue": 2500,
  "expiry": "2026-11-15T23:59:59.000Z",
  "usageLimit": 1000
}
```

---

### 2.10 Marketplace Administration (`/api/admin`)

#### `GET /api/admin/analytics`
Retrieve marketplace KPIs (Gross sales, commission earnings, vendor counts, order metrics).
- **Access**: Private (Role: Admin)

#### `PATCH /api/admin/vendors/:id/status`
Approve or reject a vendor application.
- **Access**: Private (Role: Admin)
- **Request Body**: `{ "status": "approved" }`

#### `GET /api/admin/orders`
Platform-wide order oversight.
- **Access**: Private (Role: Admin)

#### `GET /api/admin/users`
User account management & role inspection.
- **Access**: Private (Role: Admin)

---

## 3. Role-Based Access Control (RBAC) & Authorization Rules

### 3.1 Permission Matrix

| Resource / Endpoint | Public | Customer | Vendor | Admin |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/register`, `/login` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/products`, `/:id` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/reviews/product/:id` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/payments/webhook` | ✅ (Signature) | ❌ | ❌ | ❌ |
| `POST /api/vendors/apply` | ❌ | ✅ | ❌ | ❌ |
| `GET /api/cart`, `POST /api/cart/items` | ❌ | ✅ | ❌ | ❌ |
| `POST /api/orders`, `GET /api/orders/my`| ❌ | ✅ | ❌ | ❌ |
| `POST /api/payments/create-order`, `/verify` | ❌ | ✅ | ❌ | ❌ |
| `POST /api/reviews/product/:id` | ❌ | ✅ (Verified only) | ❌ | ❌ |
| `GET /api/vendors/me`, `PATCH /api/vendors/me` | ❌ | ❌ | ✅ (Own Only) | ✅ |
| `POST /api/products`, `PATCH /api/products/:id` | ❌ | ❌ | ✅ (Own Only) | ✅ |
| `POST /api/uploads/presigned-url` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/orders/vendor/items` | ❌ | ❌ | ✅ (Own Items) | ✅ |
| `PATCH /api/orders/vendor/.../status` | ❌ | ❌ | ✅ (Own Items) | ✅ (Override) |
| `GET /api/admin/*` (Analytics, Approvals) | ❌ | ❌ | ❌ | ✅ |

---

### 3.2 Authorization & Resource Ownership Rules

Backend enforcement is strictly required across all API endpoints. Frontend route guards only control presentation and must never be considered security boundaries.

1. **Customer Ownership**:
   - Customers may only access and manipulate their own cart (`cart:user:<userId>`), profile, and order history (`orders` where `customerId === req.user.id`).
   - Customers can only review products that exist in their completed, paid orders.
   - Customers cannot access vendor dashboards, create products, or view administrative data.

2. **Vendor Ownership & Multi-Vendor Order Isolation**:
   - A vendor may only view and update their own store details and product catalog (`products` where `vendorId === req.user.id`).
   - When an order contains products from multiple stores, a vendor may only inspect and update fulfillment statuses (`placed` → `packed` → `shipped` → `delivered`) for their **own items**. Attempting to modify another vendor's item status is blocked with `403 Forbidden`.
   - Vendors cannot access administrative management endpoints or other vendors' financial metrics.

3. **Admin Authority**:
   - Admins possess comprehensive administrative authorization: approving/rejecting vendor applications, setting platform commissions, overriding disputed order statuses, and monitoring platform analytics.

4. **Public Visitors**:
   - Public visitors may browse active products and approved store catalogs, view published reviews, and register/login.
   - All write operations, cart actions, checkout, and account operations require authenticated tokens.

5. **Implementation in Code**:
   - Authentication middleware: [`server/src/middleware/authenticate.js`](file:///d:/Github/Multi-Vender%20Ecom%20MarketPlace/server/src/middleware/authenticate.js)
   - Role & ownership middleware: [`server/src/middleware/authorize.js`](file:///d:/Github/Multi-Vender%20Ecom%20MarketPlace/server/src/middleware/authorize.js)
   - Ownership helper: `verifyOrderItemOwnership(order, itemId, user)` prevents cross-vendor fulfillment mutations.
