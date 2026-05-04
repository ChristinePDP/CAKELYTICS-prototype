# 🎂 Aileen & Niculus Bake Shop — POS & Management System

A full-featured frontend prototype for a bake shop point-of-sale and management system. Built with **React + Vite + Tailwind CSS**.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Pages Overview](#pages-overview)
5. [Component Guide](#component-guide)
6. [Data & State](#data--state)
7. [Connecting to a Backend](#connecting-to-a-backend)

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v3 | Styling (utility-first) |
| React Router v6 | Client-side routing |
| Recharts | Analytics charts |
| Lucide React | Icons |

**Fonts used:**
- `Playfair Display` — Headings / serif accents
- `DM Sans` — Body text / UI elements

---

## 📁 Project Structure

```
aileen-niculus-pos/
├── src/
│   ├── data/
│   │   └── dummyData.js          ← All dummy/seed data (replace with API calls)
│   ├── context/
│   │   └── AppContext.jsx         ← Global state (React Context + useState)
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.jsx      ← Sidebar, TopBar, page wrapper
│   │   └── ui/
│   │       └── index.jsx          ← All reusable UI components
│   ├── pages/
│   │   ├── AnalyticsPage.jsx
│   │   ├── POSPage.jsx
│   │   ├── AllOrdersPage.jsx
│   │   ├── ProductManagementPage.jsx
│   │   ├── InventoryPage.jsx
│   │   └── SettingsPage.jsx
│   ├── App.jsx                    ← Router + page map
│   ├── main.jsx                   ← React entry point
│   └── index.css                  ← Tailwind base + custom animations
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
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

## 📦 Data & State

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
Global state via React Context. Wraps the entire app.

All CRUD operations are here. When connecting to a backend, **replace the `useState` initializers and mutation functions with API calls** (e.g., `fetch`, `axios`, `react-query`).

```js
// Example: replace addProduct
const addProduct = useCallback(async (product) => {
  const res = await api.post('/products', product);
  setProducts(prev => [...prev, res.data]);
}, []);
```

---

## 🔌 Connecting to a Backend

1. **Replace dummy data** in `src/data/dummyData.js` with your initial state or remove it.
2. **Replace mutations** in `src/context/AppContext.jsx` with API calls.
3. **Add loading states** — the components are already structured to easily add `isLoading` props to tables and cards.
4. **Authentication** — the sidebar has a Logout button ready to wire up. Add a protected route wrapper in `App.jsx`.
5. **Image uploads** — the Product modal has an upload button ready. Wire to your storage (e.g., Cloudinary, S3, Firebase Storage).

### Suggested Backend Endpoints

```
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/orders
POST   /api/orders
PATCH  /api/orders/:id/status

GET    /api/ingredients
POST   /api/ingredients
PUT    /api/ingredients/:id
DELETE /api/ingredients/:id

GET    /api/recipes
POST   /api/recipes
PUT    /api/recipes/:id
DELETE /api/recipes/:id

POST   /api/production-logs
GET    /api/production-logs

POST   /api/waste-logs
GET    /api/waste-logs
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

## 📝 Notes

- **No authentication** is included in this prototype. Add a login page + route guard when building for production.
- **Stock numbers** shown as "10 LEFT" on POS cards are hardcoded in `dummyData.js`. Wire to real inventory when connecting backend.
- **Images** use Unsplash URLs. Replace with your own product photos locally or via an image hosting service.
- This frontend is **panel/presentation ready** — all pages are functional, connected, and consistent.
