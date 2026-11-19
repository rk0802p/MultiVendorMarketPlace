# TechMart: Multi-Vendor E-Commerce Marketplace

A full-stack, production-ready multi-vendor e-commerce platform where multiple independent vendors can set up stores and list products, customers can browse and purchase items from multiple vendors in a single checkout, and the platform earns an automated commission on every eligible sale.

---

## 1. Project Overview & Architecture

TechMart is implemented as a **Modular Monolith** containing a separated React frontend and Express backend with centralized data services:

- **Customer Storefront**: Browse categories, full-text search with faceted filtering via Elasticsearch, shopping cart via Redis, multi-vendor unified checkout, order tracking, and verified reviews.
- **Vendor Dashboard**: Store onboarding, approval workflows, product catalog management, S3 direct media uploads, independent order fulfillment management.
- **Admin Control Center**: Vendor store approval/rejection, commission configuration, marketplace analytics, order oversight.

```
multi-vendor-marketplace/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS)
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── layouts/            # Layout wrappers (Navbar, Sidebar, Footer)
│       ├── pages/              # Customer, Vendor, and Admin views
│       ├── hooks/              # Custom React hooks
│       ├── services/           # Axios API services
│       ├── context/            # Auth, Cart, and Toast contexts
│       └── routes/             # Protected and public routes
├── server/                     # Backend Modular Monolith (Node.js, Express)
│   └── src/
│       ├── config/             # Environment, DB, Redis, AWS, ES configurations
│       ├── models/             # Mongoose schemas (User, Store, Product, Order, etc.)
│       ├── middleware/         # Auth, RBAC, Error Handling, Validation
│       ├── modules/            # Feature modules (auth, vendors, products, cart, orders, etc.)
│       ├── jobs/               # Asynchronous workers & sync jobs
│       ├── utils/              # Response helpers, commission calculator, pdf generator
│       ├── app.js              # Express app definition & route mounting
│       └── server.js           # Server bootstrap and graceful shutdown
├── docs/                       # Architectural, technical & design documentation
│   ├── architecture.md         # Detailed architectural diagrams & patterns
│   ├── database-schema.md      # MongoDB & Redis schemas and ER diagrams
│   ├── api-documentation.md    # API endpoints inventory and RBAC matrix
│   ├── deployment-guide.md     # Production cloud deployment guide
│   ├── test-report.md          # Test scenarios, test runner logs & benchmarks
│   ├── design-system.md        # Monochromatic design system tokens & WCAG AA contrast
│   ├── changelog-redesign.md   # Design system migration audit & changelog
│   └── screenshots/            # Application & verification screenshots
├── .env.example                # Root environment variables template
├── .gitignore                  # Git ignore rules for node_modules, build & secrets
└── README.md                   # Project documentation
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Single Page Application (SPA), lightning-fast HMR |
| **Styling & UI** | Tailwind CSS 3.4 + Monochromatic Design System | Refined Cool Blue-Slate design tokens, Light/Dark themes, WCAG AA/AAA compliant |
| **Backend** | Node.js + Express | RESTful APIs, modular architecture, business logic |
| **Primary Database** | MongoDB + Mongoose | Users, stores, products, orders, payments, reviews |
| **Cache & Cart** | Redis | Persistent cart storage (`cart:user:<userId>`) & transient caching |
| **Search Engine** | Elasticsearch | High-performance search, filtering, and facets |
| **Image Storage** | AWS S3 | Direct browser uploads via presigned URLs |
| **Payment Gateway** | Razorpay (Test Mode) | Marketplace payouts, webhook verification, signature validation |
| **Testing** | Vitest, Supertest | Unit calculations, route authorization, integration tests |

---

## 3. Marketplace Business Model & Commission Calculation

Suppose a customer purchases two items in a single cart from two independent vendors:

| Item | Vendor | Amount |
| :--- | :--- | :--- |
| Mechanical Keyboard | Vendor A | ₹2,000 |
| Ergonomic Mouse Pad | Vendor B | ₹1,000 |
| **Subtotal** | | **₹3,000** |
| **Platform Commission (10%)** | | **₹300** |
| **Vendor A Gross Share (90%)** | | **₹1,800** |
| **Vendor B Gross Share (90%)** | | **₹900** |

At checkout:
1. The platform securely collects ₹3,000.
2. An immutable payment ledger entry records the 10% platform share (₹300) and the respective gross vendor shares.
3. Order line items are partitioned by vendor so Vendor A fulfills the keyboard while Vendor B fulfills the mouse pad independently.

---

## 4. Comprehensive Feature Breakdown

### A. Customer Storefront & Unified Experience
- **Search & Multi-Facet Filtering**: Full-text keyword search, price range filtering, category aggregation, and instant stock filters with dual-engine execution (Elasticsearch + resilient MongoDB fallback).
- **Unified Multi-Vendor Cart**: Persistent Redis shopping cart allowing products from multiple different merchants in one cart.
- **Concurrency-Safe Atomic Checkout**: Optimistic concurrency controls decrement stock atomically to eliminate overselling and race conditions.
- **Payment Gateway with Idempotent Webhooks**: Seamless Razorpay integration supporting UPI, NetBanking, and domestic cards, backed by background webhook signature verification (`order.paid`, `payment.failed`).
- **Self-Service Order Tracking & PDF Invoices**: Line-item package tracking per vendor and instant downloadable tax invoice generation using PDFKit.
- **Verified Buyer Reviews**: Rating and review submissions strictly verified against customer purchase history.

### B. Vendor Portal & Fulfillment Operations
- **Store Onboarding & Approval**: Seamless application process with automated slug generation and administrative approval checks.
- **Product Catalog & AWS S3 Uploads**: Complete CRUD for listings, variant pricing, specifications, and direct browser-to-S3 media uploads via presigned URLs.
- **Tenant Isolation**: Multi-tenant architectural barriers prevent vendors from viewing or editing competitor products or orders.
- **Independent Order Fulfillment**: Vendors view only their slice of an order and independently advance packages (`placed` → `packed` → `shipped` → `delivered`) with distinct carrier tracking numbers.

### C. Admin Control Center & Platform Intelligence
- **Store Review & Moderation**: Approve or reject vendor applications with automated notification triggers.
- **Automated Commission Accounting**: Real-time ledger tracking the 10% platform commission and calculating net payouts for every transaction.
- **Marketplace Analytics Dashboard**: Interactive executive dashboards visualizing Gross Merchandise Value (GMV), net platform earnings, vendor growth, and fulfillment ratios.

### D. Verification Screenshots
| View | Description | File Path |
| :--- | :--- | :--- |
| **Marketplace Catalogue** | Multi-faceted category filtering & search engine | [`docs/screenshots/01_marketplace_catalogue.jpg`](docs/screenshots/01_marketplace_catalogue.jpg) |
| **Atomic Checkout** | Multi-vendor order summary & payment method | [`docs/screenshots/02_atomic_checkout.png`](docs/screenshots/02_atomic_checkout.png) |
| **Order Tracking** | Independent vendor fulfillment packages & timeline | [`docs/screenshots/03_order_tracking_fulfillment.png`](docs/screenshots/03_order_tracking_fulfillment.png) |
| **Razorpay Webhooks** | Signature-verified webhook event listener | [`docs/screenshots/04_razorpay_webhook_setup.png`](docs/screenshots/04_razorpay_webhook_setup.png) |

---

## 5. Execution Roadmap

- [x] **Pre-Step 1**: Repository initialization, folder structure scaffolding, baseline configuration, environment templates, docs skeleton.
- [x] **Step 1**: Technical planning, database schema modeling, API contract specification, and role/permission matrix.
- [x] **Step 2**: Authentication module (JWT, bcrypt, HttpOnly cookies) and RBAC middleware.
- [x] **Step 3**: Vendor onboarding & approval workflows; Product CRUD & AWS S3 presigned uploads.
- [x] **Step 4**: Elasticsearch indexing, full-text search, multi-faceted filtering, and sorting.
- [x] **Step 5**: Redis-backed cart, atomic checkout with concurrency-safe stock decrement, and multi-vendor order lifecycle (`placed` → `packed` → `shipped` → `delivered`).
- [x] **Step 6**: Razorpay test mode integration, signature validation, commission ledger, and idempotent webhooks.
- [x] **Step 7**: Verified-buyer reviews, promo coupons, PDF invoice generation, and admin analytics dashboard.
- [x] **Step 8 (Final Deliverables & Verification)**: End-to-end integration testing, security hardening, cloud deployment (Render + Vercel + MongoDB Atlas), and final demo submission.

---

## 6. Installation & Run Steps (Local & Cloud)

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas connection string)
- Redis (Local or managed Redis instance)
- Elasticsearch (Local or Elastic Cloud instance)

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/rk0802p/MultiVendorMarketPlace.git
   cd "Multi-Vender Ecom MarketPlace"
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example server/.env
   cp client/.env.example client/.env
   ```
   Fill in your MongoDB URI, JWT secret, and optional service keys.

3. **Install Dependencies:**
   ```bash
   npm run install:all
   ```

4. **Seed Demonstration Data (Optional):**
   ```bash
   npm --prefix server run seed
   ```
   Seeds Admin (`admin@techmart.local` / `AdminPass123!`), 3 approved vendor stores, 65+ products (curated flagship electronics + live **DummyJSON** & **Fake Store API** reference products and verified reviews, with automatic offline fallback or `--curated-only`), coupons (`SAVE10`, `TECH100`, `FESTIVE500`), and sample verified customer orders.

5. **Start Development Servers:**
   ```bash
   # In terminal 1 (Backend API on port 5000):
   npm run dev:server

   # In terminal 2 (Frontend Client on port 5173):
   npm run dev:client
   ```

6. **Verify Installation & Cloud Deployment:**
   - Healthcheck: `http://localhost:5000/health`
   - Storefront UI: `http://localhost:5173`
   - Production Cloud Deployment Guide: [`docs/deployment-guide.md`](file:///docs/deployment-guide.md)
   - Comprehensive Test Report (103 Tests): [`docs/test-report.md`](file:///docs/test-report.md)
   - Monochromatic Design System Specification: [`docs/design-system.md`](file:///docs/design-system.md)
   - Design System Redesign Changelog: [`docs/changelog-redesign.md`](file:///docs/changelog-redesign.md)
