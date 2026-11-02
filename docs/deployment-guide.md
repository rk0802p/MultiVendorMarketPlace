# Cloud Deployment & Production Operations Guide

This guide outlines the production deployment architecture and step-by-step setup for **TechMart: Multi-Vendor E-Commerce Marketplace**.

---

## 1. Production Architecture Overview

The marketplace is architected as a **Modular Monolith** with separated cloud infrastructure:

```
                            ┌─────────────────────────────────┐
                            │    Vercel (Global Edge CDN)     │
                            │    React 18 + Vite SPA Frontend │
                            └────────────────┬────────────────┘
                                             │ HTTPS / REST
                                             ▼
                            ┌─────────────────────────────────┐
                            │    Render.com (Web Service)     │
                            │    Node.js + Express Monolith   │
                            └────┬───────────┬───────────┬────┘
                                 │           │           │
           ┌─────────────────────┴┐          │           └─────────────────────┐
           ▼                      ▼          ▼                                 ▼
┌──────────────────────┐ ┌───────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  MongoDB Atlas       │ │ Upstash Redis │ │ Elastic Cloud        │ │ AWS S3 / CloudFront  │
│  Primary Document DB │ │ Cart & Cache  │ │ Catalog Search Engine│ │ Presigned Uploads    │
└──────────────────────┘ └───────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 2. Cloud Infrastructure Components

| Service | Cloud Provider | Free Tier / Plan | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | Vercel | Hobby Tier | React 18 single-page application with SPA rewrites (`vercel.json`) |
| **Backend API** | Render.com | Free Web Service | Express server, modular monolith routes, rate limiting, PDF generation |
| **Primary Database** | MongoDB Atlas | M0 Free Cluster | Relational documents: Users, Stores, Products, Orders, Payments, Reviews |
| **Cache & Cart** | Upstash Redis | Free Serverless | Persistent shopping cart (`cart:user:<userId>`) with automatic TTL |
| **Search Engine** | Elastic Cloud | Free Trial / Self-Hosted | `title^3` boosted full-text search, multi-faceted filtering, sorting |
| **Media Storage** | AWS S3 | S3 Standard | Vendor product images uploaded directly via secure presigned URLs |
| **Payment Gateway** | Razorpay | Test / Live Mode | Marketplace checkout, HMAC signature validation, webhook synchronization |

---

## 3. Step-by-Step Deployment Instructions

### 3.1 Backend Deployment (Render.com)

1. **Connect Repository**:
   - Create a new **Web Service** on Render connected to this repository (`master` branch).
2. **Build & Start Commands**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   Configure the following environment variables in the Render dashboard:
   ```env
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-marketplace.vercel.app
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/techmart?retryWrites=true&w=majority
   REDIS_URL=rediss://default:<password>@your-redis-instance.upstash.io:6379
   ELASTICSEARCH_NODE=https://your-elastic-deployment.es.io:9243
   ELASTICSEARCH_API_KEY=<your-elastic-api-key>
   JWT_SECRET=<strong-random-64-character-secret>
   RAZORPAY_KEY_ID=rzp_test_YourKeyHere
   RAZORPAY_KEY_SECRET=YourSecretHere
   RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
   AWS_ACCESS_KEY_ID=<your-aws-access-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=techmart-marketplace-uploads
   ```
4. **Seed Demonstration Data** (Optional):
   Run the seed script in the Render Shell:
   ```bash
   npm run seed
   ```

---

### 3.2 Frontend Deployment (Vercel)

The repository supports **two seamless Vercel deployment modes**:

#### Option A: Zero-Config Root Deployment (Recommended)
1. **Import Repository**: In the Vercel dashboard, click **Add New** $\rightarrow$ **Project** and select this repository (`master` branch).
2. **Leave Root Directory as `./` (Default)**:
   - Root [`vercel.json`](file:///vercel.json) automatically executes `npm --prefix client install && npm --prefix client run build` and sets the output directory to `client/dist`.
3. **Environment Variables**:
   Add the following environment variable in Vercel:
   ```env
   VITE_API_BASE_URL=https://techmart-marketplace-api.onrender.com/api
   ```
4. **Deploy**: Click **Deploy**. Vercel will build Vite and serve the single page application with full SPA client-side routing.

#### Option B: Subdirectory Deployment
1. **Import Repository**: Select this repository in Vercel.
2. **Root Directory**: Click "Edit" and choose `client`.
3. **Framework**: Vite is detected automatically.
4. **Output Directory**: `dist` (default).
5. **Environment Variables**:
   ```env
   VITE_API_BASE_URL=https://techmart-marketplace-api.onrender.com/api
   ```
6. **SPA Client Routing**: Handled by [`client/vercel.json`](file:///client/vercel.json).

---

## 4. Razorpay Webhook Configuration

1. In the Razorpay Dashboard, navigate to **Settings** $\rightarrow$ **Webhooks**.
2. Add a new webhook URL: `https://techmart-marketplace-api.onrender.com/api/payments/webhook`.
3. Set your secret token to match `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribe to the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. The backend validates the HMAC-SHA256 signature and executes idempotent order status updates.

---

## 5. Security Hardening Checklist

- [x] **Rate Limiting**: `express-rate-limit` enforces 1000 requests per 15-minute window globally, with 50 attempts on authentication routes (`/api/auth/login`, `/api/auth/register`).
- [x] **HTTP Security Headers**: `helmet` enabled with Content-Security-Policy and XSS filtering.
- [x] **Cross-Origin Resource Sharing**: Strict CORS configuration restricting origins to `config.clientUrl` with credentials support.
- [x] **Sensitive Hash Protection**: User password hashes filtered out from all JSON transformations and API responses.
- [x] **Resource Ownership Enforcement**: Multi-vendor line item fulfillment isolated so vendors cannot mutate items from competing stores.
- [x] **Direct S3 Uploads**: Browser uploads directly to private AWS S3 buckets using presigned PUT URLs, preventing file upload vulnerabilities on the Express server.
- [x] **Verified Buyer Constraint**: Product reviews restricted to customers who completed verified orders.
