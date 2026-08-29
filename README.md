# HomeLedger — Household & Personal Expense Tracker (MERN Stack)

**HomeLedger** is a complete, production-quality personal and household expense tracking and financial analytics web application built on the **MERN** stack (MongoDB, Express, React, Node.js). It enables households to log daily expenses, categorize transactions, attribute spending to specific family members/spenders ("whose money"), inspect trajectory trends over customizable periods, drill down into detailed category timelines, and generate executive PDF / Excel CSV reports.

---

## 🌟 Key Features

1. **Executive Overview Dashboard**:
   - **Flexible Period Selector**: `Today`, `This Week`, `This Month`, `Last Month`, `This Year`, or `Custom Date Range`.
   - **Multi-Category Filter Chips**: Toggle any combination of categories (Electricity, Milk, Groceries/Food, Other, etc.) with live spend badges.
   - **Household Spender Filter**: View spending by specific persons (`Father`, `Mother`, `Self`, `Common / Shared`).
   - **Summary KPI Strip**: Total Spend, % change compared to prior equivalent duration, Daily Average, Top Spender & Top Category.
   - **Adaptive Trajectory Trends**: Interactive Stacked Bar and Area chart (using Recharts) grouped adaptively by day, week, or month.
   - **Category Distribution Donut**: Category % share visualization with centered total readout and interactive legend.
   - **Per-Category Summary Cards with "Detailed View" Drilldown**: Inspect individual category totals, progress, and click **Detailed View** to see granular daily trajectories, subcategory splits, and itemized records.

2. **Intuitive 2-Step Add / Edit Expense**:
   - **Step 1: Visual Category Picker**: Large interactive cards with category colors, Lucide icons, and active state highlights.
   - **Step 2: Rich Form Inputs**: Currency-formatted amount with quick `$5, $10, $20, $50, $100` increment chips, editable date picker (defaults to today), dynamically filtered subcategories (with inline `+ Add Subcategory` popover), household member selector (with inline `+ Add Spender` popover), and notes.

3. **Filterable & Sortable Expense Ledger**:
   - Search across descriptions, notes, or amounts.
   - Sort by Date (newest/oldest) and Amount (highest/lowest).
   - Inline and modal Edit and Delete with destructive action confirmation.

4. **Executive PDF & CSV Reports**:
   - **Publication-ready PDF**: Built with PDFKit on the backend, featuring branding, executive KPI cards, category breakdown table, and full itemized ledger.
   - **CSV Export**: Clean tabular export via `json2csv` compatible with Microsoft Excel, Apple Numbers, and Google Sheets.

5. **Settings & Configurations Manager**:
   - Create, edit, and delete custom categories with a 12-color swatch palette and dynamic Lucide icon picker.
   - Create and manage subcategories nested under each category.
   - Manage household member spenders ("whose money").
   - Safety checks preventing deletion of categories/people linked to existing expense records.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM, Express-Validator, PDFKit, JSON2CSV, CORS, Dotenv.
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React icons, Recharts, Date-fns, React Hot Toast, Axios.
- **Monorepo Layout**: Root orchestrated with `concurrently` to run both client and server in one command.

```
Billing application/
├── package.json                   # Root monorepo scripts (dev, build, seed, install:all)
├── README.md                      # Documentation & instructions
├── server/
│   ├── .env                       # PORT=5000, MONGO_URI
│   ├── server.js                  # Express application entry & auto-seeding check
│   ├── config/db.js               # Mongoose MongoDB connection
│   ├── models/                    # Category, Subcategory, Person, Expense schemas
│   ├── controllers/               # Category, Subcategory, Person, Expense, Report controllers
│   ├── routes/                    # RESTful Express route handlers
│   ├── services/                  # Analytics aggregation pipelines & PDF report generator
│   ├── middleware/                # Validation & centralized error handler
│   └── seeds/seed.js              # Database seeder with realistic 90-day historical data
└── client/
    ├── index.html
    ├── vite.config.js             # Vite config with API proxy to localhost:5000
    ├── tailwind.config.js         # Design system tokens and custom color palettes
    └── src/
        ├── App.jsx                # Main router and global modal providers
        ├── index.css              # Custom styling, Inter font, scrollbars, micro-animations
        ├── api/                   # Axios API service clients
        ├── context/               # Unified ExpenseContext state management
        ├── components/            # Reusable UI component library (Dashboard, Expenses, Reports, Manage)
        ├── pages/                 # DashboardPage, ExpensesPage, ReportsPage, ManagePage
        └── utils/                 # Currency formatters, date-fns helpers, dynamic icon resolver
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on `mongodb://localhost:27017` (or MongoDB Atlas connection string)

### 1. Clone or Navigate to Project
```bash
cd "d:/project/full stack development/Billing application"
```

### 2. Install Dependencies
You can install all dependencies (root, server, and client) with one command:
```bash
npm run install:all
```
*(Or manually run `npm install` in `/`, `/server`, and `/client`)*.

### 3. Configure Environment Variables
Verify or edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/homeledger
NODE_ENV=development
```

### 4. Seed Initial Data
Seed default categories (`Electricity`, `Milk`, `Groceries / Food`, `Other`), default subcategories, default household spenders (`Common / Shared`, `Father`, `Mother`, `Self`), and 90 days of realistic sample expense data:
```bash
npm run seed
```
*(Note: The server also auto-seeds if an empty database is detected on first start)*.

### 5. Run Development Servers
Start both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Open your browser at:
**[http://localhost:5173](http://localhost:5173)**

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | - |
| `GET` | `/api/categories` | Get all categories with subcategories | - |
| `POST` | `/api/categories` | Create custom category | `{ name, color, icon, isDefault }` |
| `PUT` | `/api/categories/:id` | Update category | `{ name, color, icon }` |
| `DELETE` | `/api/categories/:id` | Delete category & subcategories | - |
| `GET` | `/api/subcategories` | Get subcategories | `?categoryId=...` |
| `POST` | `/api/subcategories` | Create subcategory | `{ name, categoryId }` |
| `GET` | `/api/people` | Get household members / spenders | - |
| `POST` | `/api/people` | Add person / spender | `{ name, isDefault }` |
| `GET` | `/api/expenses` | Get filterable & sortable expense list | `?startDate=&endDate=&categoryIds=&personId=&search=&sortBy=&sortOrder=&page=&limit=` |
| `POST` | `/api/expenses` | Record new expense | `{ amount, date, categoryId, subcategoryId, personId, note }` |
| `PUT` | `/api/expenses/:id` | Update existing expense | `{ amount, date, categoryId, subcategoryId, personId, note }` |
| `DELETE` | `/api/expenses/:id` | Delete expense | - |
| `GET` | `/api/expenses/summary` | Aggregation pipeline for KPI metrics & trend chart | `?startDate=&endDate=&categoryIds=&personId=` |
| `GET` | `/api/expenses/drilldown` | Granular drill-down timeline & subcategory breakdown | `?categoryId=&startDate=&endDate=` |
| `GET` | `/api/expenses/report` | Download report in PDF or CSV | `?format=pdf|csv&startDate=&endDate=&categoryIds=&personId=` |

---

## 🎨 Design Palette & Fixed Categories

- **Primary Teal**: `#0F766E` / `#0D9488` / `#14B8A6`
- **Slate Neutrals**: `#0F172A`, `#1E293B`, `#64748B`, `#F8FAFC`
- **Electricity Category**: `#F59E0B` (Amber)
- **Milk Category**: `#0EA5E9` (Sky Blue)
- **Groceries / Food Category**: `#22C55E` (Emerald)
- **Other Category**: `#8B5CF6` (Purple)

---

## 📄 License
MIT License. Built for seamless household financial clarity.
