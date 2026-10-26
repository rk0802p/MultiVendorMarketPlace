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
├── docs/                       # Architectural & technical documentation
│   ├── architecture.md         # Detailed architectural diagrams & patterns
│   ├── database-schema.md      # MongoDB & Redis schemas and ER diagrams
│   ├── api-documentation.md    # API endpoints inventory and RBAC matrix
│   └── test-report.md          # Test scenarios, test runner logs & benchmarks
├── .env.example                # Root environment variables template
├── .gitignore                  # Git ignore rules for node_modules, build & secrets
└── README.md                   # Project documentation
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Single Page Application (SPA), lightning-fast HMR |
| **Styling** | Tailwind CSS | Responsive, modern, clean marketplace UI |
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

## 4. 14-Day Execution Schedule & Roadmap

- [x] **Pre-Step 1**: Repository initialization, folder structure scaffolding, baseline configuration, environment templates, docs skeleton.
- [ ] **Day 1 (Step 1)**: Technical planning, database schema modeling, API contract specification, and role/permission matrix.
- [ ] **Day 2 (Step 2)**: Authentication module (JWT, bcrypt, HttpOnly cookies) and RBAC middleware.
- [ ] **Days 3–4 (Step 3)**: Vendor onboarding & approval workflows; Product CRUD & AWS S3 presigned uploads.
- [ ] **Day 5 (Step 4)**: Elasticsearch indexing, full-text search, multi-faceted filtering, and sorting.
- [ ] **Days 6–8 (Step 5)**: Redis-backed cart, atomic checkout with concurrency-safe stock decrement, and multi-vendor order lifecycle (`placed` → `packed` → `shipped` → `delivered`).
- [ ] **Days 9–10 (Step 6)**: Razorpay test mode integration, signature validation, commission ledger, and idempotent webhooks.
- [ ] **Days 11–12 (Step 7)**: Verified-buyer reviews, promo coupons, PDF invoice generation, and admin analytics dashboard.
- [ ] **Days 13–14**: End-to-end integration testing, security hardening, cloud deployment (Render + Vercel + MongoDB Atlas), and final demo submission.

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas connection string)
- Redis (Local or managed Redis instance)
- Elasticsearch (Local or Elastic Cloud instance)

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
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

4. **Start Development Servers:**
   ```bash
   # In terminal 1 (Backend API on port 5000):
   npm run dev:server

   # In terminal 2 (Frontend Client on port 5173):
   npm run dev:client
   ```

5. **Verify Installation:**
   - Healthcheck: `http://localhost:5000/health`
   - Storefront UI: `http://localhost:5173`
