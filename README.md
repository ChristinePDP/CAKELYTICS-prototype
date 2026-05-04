# 🎂 Aileen & Niculus Bake Shop — POS & Management System

A full-featured frontend prototype for a bake shop point-of-sale and management system. Built with **React + Vite + Tailwind CSS**.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Pages Overview](#pages-overview)
5. [Component Guide](#component-guide)
6. [API Services](#api-services)
7. [Data & State](#data--state)
8. [Connecting to a Backend](#connecting-to-a-backend)
9. [Environment Configuration](#%EF%B8%8F-environment-configuration)
10. [Deploying to Vercel](#-deploying-to-vercel)
11. [Notes](#-notes)

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v3 | Styling (utility-first) |
| React Router v6 | Client-side routing || Axios 1.14 | HTTP client with centralized API instance || Recharts | Analytics charts |
| Lucide React | Icons |

**Fonts used:**
- `Playfair Display` — Headings / serif accents
- `DM Sans` — Body text / UI elements

---

## 📁 Project Structure

```
aileen-niculus-pos/
├── src/
│   ├── services/                              ← API service layer
│   │   ├── api.js                             ← Centralized Axios instance
│   │   ├── authService.js                     ← Auth endpoints
│   │   ├── orderService.js                    ← Order endpoints
│   │   └── productService.js                  ← Product endpoints
│   ├── data/
│   │   └── dummyData.js                       ← All dummy/seed data (replace with API calls)
│   ├── context/
│   │   └── AppContext.jsx                     ← Global state (React Context + useState)
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.jsx                  ← Sidebar, TopBar, page wrapper
│   │   └── ui/
│   │       └── index.jsx                      ← All reusable UI components
│   ├── pages/
│   │   ├── customer/                          ← Customer-facing pages
│   │   │   ├── CustomerHome.jsx
│   │   │   ├── CustomerMenu.jsx
│   │   │   ├── CustomerCheckout.jsx
│   │   │   └── ...
│   │   ├── inventory/                         ← Inventory management
│   │   │   ├── RawTab.jsx
│   │   │   ├── RecipeTab.jsx
│   │   │   └── WasteTab.jsx
│   │   ├── AnalyticsPage.jsx                  ← Dashboard & KPIs
│   │   ├── POSPage.jsx                        ← Point of Sale
│   │   ├── AllOrdersPage.jsx                  ← Order Management
│   │   ├── ProductManagementPage.jsx          ← Product CRUD
│   │   ├── InventoryPage.jsx                  ← Inventory tracking
│   │   └── LoginPage.jsx                      ← Authentication
│   ├── assets/
│   │   └── images/                            ← Product & homepage images
│   ├── utils/
│   │   └── inventoryHelpers.js                ← Utility functions
│   ├── App.jsx                                ← Router + page map
│   ├── main.jsx                               ← React entry point
│   └── index.css                              ← Tailwind base + custom animations
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                                       ← Development environment
├── .env.production                            ← Production environment
└── README.md
```

---

## 🚀 Getting Started

### Requirements

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open your browser at **http://localhost:5173**

### Build for production

```bash
npm run build
npm run preview
```

---

## 📄 Pages Overview

### 1. Analytics (`/`)
- KPI Cards: Total Sales, Expenses, Gross Profit, Profit Margin
- Trend line chart (Day / Week / Month / Year tabs)
- Top 5 Products bar ranking
- Business insights cards (ranking, seasonal, stock alert)

### 2. Point of Sale (`/pos`)
- Product grid with images (filter by category, search)
- Cart panel with qty +/- controls
- **Order Now** mode: immediate full payment
- **Pre-Order** mode: customer details form, pickup date/time, special instructions, 50% deposit or full payment toggle
- Checkout modal with cash tendered + change calculation
- Completed orders are automatically appended to All Orders

### 3. All Orders (`/orders`)
- Table with: Order ID, Customer, Type (Pre-Order / Buy Now), Amount, Payment status, Pickup date, Status
- Filter by status: All / Confirmed / Ready / Completed / Cancelled
- Search by order ID or customer name
- **View Details** modal showing:
  - Customer name, phone, Facebook
  - Full order summary table
  - Payment breakdown (deposit / balance)
  - Customer reference image
  - Special instructions
  - **Mark as Ready** / **Mark as Completed** / **Cancel Order** actions
- Pagination (8 orders per page)

### 4. Product Management (`/products`)
- Grid of product cards with image, category, price, daily limit
- Search & filter by category
- **Add Product** / **Edit Product** modal with:
  - Product name, category, price, inclusion/description
  - Image URL upload
  - Pre-order daily capacity slots
  - Date-specific exceptions (override slots per date)
- Delete confirmation modal

### 5. Inventory (`/inventory`)
Four sub-tabs:

**Raw Ingredients**
- Stat cards: Total / Low Stock / Critical
- Table with stock level bar, status badges
- Add/Edit ingredient modal (with stock add & history accordion)

**Production Log**
- Log new batch → selects recipe → shows ingredient deductions preview
- Auto-deducts from ingredient stock on save
- Table of all batches with deducted ingredients detail

**Ingredient Cost per Product (Recipes)**
- Manage recipes: product name, yield per batch, ingredients + quantities
- Dynamic "add ingredient row" form
- Each recipe drives Production Log deductions

**Waste Log**
- Log ingredient waste (spoiled, broken, expired) — deducts from stock
- Log unsold product (informational only, no stock deduction)
- Table with reason badges and history

### 6. Settings (`/settings`)
- Shop name, tax rate, currency, address, contact, Facebook
- Toggle switches for system preferences

---

## 🧩 Component Guide

All reusable components are exported from `src/components/ui/index.jsx`:

| Component | Usage |
|-----------|-------|
| `<Badge variant="confirmed">` | Status / type pills. Variants: `confirmed`, `ready`, `completed`, `cancelled`, `preorder`, `buynow`, `success`, `warning`, `danger` |
| `<Button variant="primary">` | Variants: `primary`, `secondary`, `ghost`, `danger`, `dark` |
| `<Input label="Name" required />` | Labeled input with hint/error support |
| `<Select label="Category">` | Labeled select dropdown |
| `<Textarea label="Notes" />` | Labeled textarea |
| `<Modal isOpen onClose title size>` | Overlay modal. Sizes: `sm`, `md`, `lg`, `xl` |
| `<Card>` | White rounded card with border + shadow |
| `<StatCard label value delta deltaDir>` | KPI card with trend indicator |
| `<Table columns>` | Table wrapper with styled thead |
| `<Tr>` / `<Td>` | Table row / cell |
| `<Pagination page count perPage onChange>` | Pagination bar |
| `<SearchBar value onChange>` | Search input with icon |
| `<FilterPills options value onChange>` | Pill/tab filter row |
| `<LevelBar stock min>` | Small colored level bar (green/amber/red) |
| `<ConfirmModal>` | Simple yes/no confirmation dialog |
| `useToast()` | Hook → `show(message, type)` — types: `success`, `warning`, `error` |

---

## � API Services

The project includes a **production-ready API service layer** with a centralized Axios instance and typed service methods.

### Architecture: `src/services/`

```
src/services/
├── api.js                    ← Centralized Axios instance (baseURL from env)
├── authService.js            ← Authentication endpoints
├── orderService.js           ← Order CRUD endpoints
└── productService.js         ← Product CRUD endpoints
```

### `src/services/api.js` — Centralized Axios Instance

**Features:**
- ✅ `baseURL` from `import.meta.env.VITE_API_URL` (environment-based routing)
- ✅ **Request Interceptor** — Automatically adds `Authorization: Bearer {token}` from localStorage
- ✅ **Response Interceptor** — Handles errors (401, 403, 404, 5xx) with logging
- ✅ 10-second timeout
- ✅ JSON content-type headers

```js
import api from './api';

// All requests automatically include auth token and error handling
const response = await api.get('/products');
```

### Service Examples

#### `src/services/authService.js`
```js
import api from './api';

export const authService = {
  login:         (data)    => api.post('/auth/login', data),
  logout:        ()        => api.post('/auth/logout'),
  sendResetCode: (email)   => api.post('/auth/forgot-password', { email }),
  verifyOtp:     (data)    => api.post('/auth/verify-otp', data),
  resetPassword: (data)    => api.post('/auth/reset-password', data),
  me:            ()        => api.get('/auth/me'),
};
```

#### `src/services/orderService.js`
```js
import api from './api';

export const orderService = {
  getAll:       (params)     => api.get('/orders', { params }),
  create:       (data)       => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};
```

#### `src/services/productService.js`
```js
import api from './api';

export const productService = {
  getAll:  ()           => api.get('/products'),
  getById: (id)         => api.get(`/products/${id}`),
  create:  (data)       => api.post('/products', data),
  update:  (id, data)   => api.put(`/products/${id}`, data),
  delete:  (id)         => api.delete(`/products/${id}`),
};
```

### Using Services in Components

```js
import { productService } from '../services/productService';

// In your component
const fetchProducts = async () => {
  try {
    const response = await productService.getAll();
    setProducts(response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    showToast('Error loading products', 'error');
  }
};
```

---

## �📦 Data & State

### `src/data/dummyData.js`
Exports all seed/dummy data:
- `PRODUCTS` — array of product objects
- `ORDERS` — array of order objects
- `INGREDIENTS` — array of ingredient objects
- `RECIPES` — array of recipe objects
- `PRODUCTION_LOGS` — array of production log entries
- `WASTE_LOGS` — array of waste log entries
- `ANALYTICS` — kpi, trend, topProducts data by view (day/week/month/year)

### `src/context/AppContext.jsx`

**Global state via React Context** that wraps the entire app and manages all CRUD operations.

**Current State:**
- Currently uses local `useState` with dummy data initialization
- Ready for backend integration — all functions are structured to accept async API calls

**What to do:**
1. Import the services: `import { productService, orderService, authService } from '../services/...'`
2. Replace mutations to call services instead of updating local state
3. Add loading/error states for async operations

**Example:**
```js
import { productService } from '../services/productService';

// Replace this:
const addProduct = useCallback((product) => {
  setProducts(prev => [...prev, { ...product, id: `p${Date.now()}` }]);
}, []);

// With this:
const addProduct = useCallback(async (product) => {
  try {
    const res = await productService.create(product);
    setProducts(prev => [...prev, res.data]);
  } catch (error) {
    console.error('Failed to create product:', error);
    // Show error toast to user
  }
}, []);
```

**Available Actions in AppContext:**
- Products: `addProduct`, `updateProduct`, `deleteProduct`
- Orders: `addOrder`, `updateOrderStatus`
- Ingredients: `addIngredient`, `updateIngredient`, `deleteIngredient`
- Recipes: `addRecipe`, `updateRecipe`, `deleteRecipe`
- Production: `confirmBatch`
- Waste: `addWaste`

---

## 🔌 Connecting to a Backend

### Environment Variables

**Development** (`.env`):
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Aileen & Niculus
VITE_APP_ENV=development
```

**Production** (`.env.production`):
```
VITE_API_URL=https://your-production-api-url.com/api
VITE_APP_ENV=production
```

Vite automatically selects the correct `.env` file based on build context (development vs. production).

### Integration Checklist

1. **Update Production API URL** in `.env.production` to your actual backend URL
2. **Create Additional Services** if needed:
   - `src/services/inventoryService.js` — Ingredients, recipes, waste logs
   - `src/services/analyticsService.js` — KPI data, trends
   - Extend existing services with more endpoints
3. **Replace Dummy Data in AppContext.jsx** — Wire up mutations to use services:
   ```js
   // Example mutation replacement
   const addProduct = useCallback(async (product) => {
     try {
       const res = await productService.create(product);
       setProducts(prev => [...prev, res.data]);
     } catch (error) {
       console.error('Failed to create product:', error);
     }
   }, []);
   ```
4. **Add Error Handling** — Leverage the response interceptor in `api.js`
5. **Implement Authentication** — Store token in localStorage after login:
   ```js
   const handleLogin = async (credentials) => {
     const res = await authService.login(credentials);
     localStorage.setItem('authToken', res.data.token);
   };
   ```
6. **Add Protected Routes** in `App.jsx` to redirect unauthenticated users to LoginPage

### Backend API Endpoints

Reference structure for your backend implementation:

```
AUTH ENDPOINTS
POST   /api/auth/login                 ← { email, password }
POST   /api/auth/logout
POST   /api/auth/forgot-password       ← { email }
POST   /api/auth/verify-otp            ← { code }
POST   /api/auth/reset-password        ← { token, newPassword }
GET    /api/auth/me                    ← Returns current user

PRODUCTS
GET    /api/products                   ← Returns array of products
POST   /api/products                   ← Create product
GET    /api/products/:id               ← Get single product
PUT    /api/products/:id               ← Update product
DELETE /api/products/:id               ← Delete product

ORDERS
GET    /api/orders                     ← List with query params (status, date, etc)
POST   /api/orders                     ← Create order
PATCH  /api/orders/:id/status          ← { status: 'Ready' | 'Completed' | 'Cancelled' }

INVENTORY (OPTIONAL - extend with inventoryService.js)
GET    /api/ingredients                ← List all ingredients
POST   /api/ingredients                ← Add ingredient
PUT    /api/ingredients/:id            ← Update stock + ledger
DELETE /api/ingredients/:id

GET    /api/recipes                    ← List all recipes
POST   /api/recipes                    ← Create recipe
PUT    /api/recipes/:id                ← Update recipe
DELETE /api/recipes/:id

GET    /api/production-logs            ← Batch production history
POST   /api/production-logs            ← Log new batch

GET    /api/waste-logs                 ← Waste entries
POST   /api/waste-logs                 ← Log waste
```

---

## 🎨 Branding / Customization

Colors are defined in `tailwind.config.js` under `theme.extend.colors.brand`:

```js
brand: {
  50:  '#FAF5F4',   // lightest
  100: '#F5EDEB',
  200: '#E8D5D1',
  300: '#D4B8B4',
  400: '#B8908A',
  500: '#8B6B64',
  600: '#6B4F48',   // primary brand
  700: '#4A3530',
  800: '#3D2B27',
  900: '#2C1F1C',   // darkest
}
```

Change these values to update the entire color scheme throughout the app.

---

## � Deploying to Vercel

This frontend is fully configured for production deployment to Vercel with environment-based API routing.

### Prerequisites

- GitHub repository linked
- Backend API URL ready (development & production)

### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Production-ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and import your GitHub repository
   - Select the project and configure settings

3. **Set Environment Variables** (Vercel Dashboard → Settings → Environment Variables):
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-production-api-url.com/api`
   - **Environments**: Production

4. **Deploy**:
   - Vercel auto-detects Vite and uses:
     - Build command: `npm run build`
     - Output directory: `dist`
   - Deploy by pushing to main or manually trigger in dashboard

### Local Production Preview

Test the production build locally:

```bash
npm run build    # Creates optimized dist/ folder
npm run preview  # Serves dist/ on http://localhost:5173
```

### Environment Isolation

- **Development**: Uses `.env` → `http://localhost:3000/api`
- **Production**: Uses `.env.production` → Your production API URL
- **Vercel**: Override via dashboard environment variables

Vite automatically selects the correct `.env` file based on build context.

---
## ⚙️ Environment Configuration

### Development
```bash
npm run dev
# Loads: .env
# API Base: http://localhost:3000/api
# Access: http://localhost:5173
```

### Production Build
```bash
npm run build
# Loads: .env.production
# API Base: https://your-production-api-url.com/api
# Output: dist/ (ready for deployment)
```

### Preview Production Build
```bash
npm run build
npm run preview
# Simulates production build locally
# Loads: .env.production
# Access: http://localhost:5173
```

### Vercel Deployment Environment Variables
Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-api.com/api` | Production |
| `VITE_APP_ENV` | `production` | Production |

---
## �📝 Notes

### Project Status
- ✅ Full frontend UI prototype with all pages implemented
- ✅ Reusable component library (20+ components)
- ✅ Production-ready API service layer with centralized Axios
- ✅ Environment-based configuration (dev/prod)
- ✅ Error handling and request interceptors
- ⏳ Backend integration ready (just wire services to AppContext)
- ⏳ Authentication (login UI ready, wire authService)
- ⏳ Image upload (UI ready, needs storage backend)

### Integration Roadmap
1. **Phase 1**: Connect `authService` → Login/Logout
2. **Phase 2**: Connect `productService` → Products CRUD
3. **Phase 3**: Connect `orderService` → Orders CRUD
4. **Phase 4**: Create `inventoryService` → Ingredients, Recipes, Waste
5. **Phase 5**: Implement authentication guards + protected routes
6. **Phase 6**: Wire image uploads to storage (S3, Cloudinary, etc)

### Deployment Notes
- **Vercel**: Auto-detects Vite, uses `npm run build`, serves `dist/`
- **Environment**: `.env` for dev, `.env.production` for prod
- **API URL**: Update `VITE_API_URL` in `.env.production` before deploying
- **No hardcoded URLs**: All API calls use environment variables ✅

### Data Notes
- **Dummy data** in `src/data/dummyData.js` — initialize real data from backend
- **Images** use Unsplash URLs — replace with your product photos
- **Stock levels** currently hardcoded — fetch from inventory service
- **All data flows** through AppContext — single source of truth
