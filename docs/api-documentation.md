# API Documentation & Contracts

## 1. Global Conventions
- Base URL: `http://localhost:5000/api`
- Content-Type: `application/json`
- Authentication: `Bearer <token>` in `Authorization` header or `jwt` HttpOnly cookie.

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

---

## 2. API Endpoints Inventory

| Module | Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | No | Public | Register customer account |
| **Auth** | `POST` | `/api/auth/login` | No | Public | Authenticate user & issue JWT |
| **Auth** | `GET` | `/api/auth/me` | Yes | Any | Get authenticated user profile |
| **Auth** | `POST` | `/api/auth/logout` | Yes | Any | Clear session / cookie |
| **Vendors**| `POST` | `/api/vendors/apply` | Yes | Customer | Apply to become a vendor |
| **Vendors**| `GET` | `/api/vendors/me` | Yes | Vendor | Retrieve vendor's own store |
| **Vendors**| `PATCH` | `/api/vendors/me` | Yes | Vendor | Update store profile details |
| **Products**| `GET` | `/api/products` | No | Public | Search, filter, paginate (via ES) |
| **Products**| `GET` | `/api/products/:id` | No | Public | Get product details & reviews |
| **Products**| `POST` | `/api/products` | Yes | Vendor | Create product listing |
| **Products**| `PATCH` | `/api/products/:id` | Yes | Vendor | Update vendor's product |
| **Products**| `DELETE`| `/api/products/:id` | Yes | Vendor | Archive vendor's product |
| **Uploads** | `POST` | `/api/uploads/presigned-url`| Yes | Vendor/Admin | Get S3 direct upload presigned URL |
| **Cart** | `GET` | `/api/cart` | Yes | Customer | Get customer's cart with live prices |
| **Cart** | `POST` | `/api/cart/items` | Yes | Customer | Add product to Redis cart |
| **Cart** | `PATCH` | `/api/cart/items/:productId`| Yes | Customer | Update item quantity |
| **Cart** | `DELETE`| `/api/cart/items/:productId`| Yes | Customer | Remove item from cart |
| **Orders** | `POST` | `/api/orders` | Yes | Customer | Validate cart & create order |
| **Orders** | `GET` | `/api/orders/my` | Yes | Customer | Customer order history |
| **Orders** | `GET` | `/api/orders/:id` | Yes | Customer/Admin | Customer single order details |
| **Orders** | `GET` | `/api/orders/:id/invoice`| Yes | Customer/Admin | Generate/download PDF invoice |
| **Orders** | `GET` | `/api/vendor/orders` | Yes | Vendor | Vendor's relevant order items |
| **Orders** | `PATCH`| `/api/vendor/orders/:orderId/items/:itemId/status` | Yes | Vendor | Advance item fulfillment status |
| **Payments**| `POST` | `/api/payments/create-order`| Yes | Customer | Create Razorpay order |
| **Payments**| `POST` | `/api/payments/verify` | Yes | Customer | Verify Razorpay payment signature |
| **Payments**| `POST` | `/api/payments/webhook` | No | Signature | Webhook for payment events |
| **Reviews** | `POST` | `/api/products/:id/reviews`| Yes | Customer | Submit review for verified purchase |
| **Coupons** | `POST` | `/api/coupons/validate` | Yes | Customer | Validate coupon against cart |
| **Coupons** | `POST` | `/api/admin/coupons` | Yes | Admin | Create promotional coupon |
| **Admin** | `GET` | `/api/admin/analytics` | Yes | Admin | Platform sales, commissions, orders |
| **Admin** | `PATCH`| `/api/admin/vendors/:id/status`| Yes | Admin | Approve or reject vendor store |
| **Admin** | `GET` | `/api/admin/orders` | Yes | Admin | Platform-wide order monitoring |
| **Admin** | `GET` | `/api/admin/users` | Yes | Admin | Manage user accounts |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Public | Customer | Vendor | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse / Search Products | ✅ | ✅ | ✅ | ✅ |
| View Product Details | ✅ | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| Cart Management | ❌ | ✅ | ❌ | ❌ |
| Place Order & Pay | ❌ | ✅ | ❌ | ❌ |
| Apply for Vendor Store | ❌ | ✅ | ❌ | ❌ |
| Manage Store & Products | ❌ | ❌ | ✅ (Own Only) | ✅ (All) |
| Fulfill Order Items | ❌ | ❌ | ✅ (Own Items) | ✅ (Override) |
| Post Review | ❌ | ✅ (Verified only) | ❌ | ❌ |
| Approve / Reject Stores | ❌ | ❌ | ❌ | ✅ |
| View Platform Analytics | ❌ | ❌ | ❌ | ✅ |
| Configure Platform Commission | ❌ | ❌ | ❌ | ✅ |
