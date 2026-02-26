# TaskSphere — Vitasoft Task Management Dashboard

A secure, single-user task management dashboard built with a NestJS REST API backend and a React + TypeScript frontend. Features JWT authentication, full task CRUD, analytics charts, a calendar view, and dark/light theme support.

**Live Frontend:** [GitHub Pages](https://nithishkumar2022020.github.io/VitaSoft-Task-Management/)
**Live Backend API:** [Azure App Service](https://tasksphere.azurewebsites.net)
**API Docs (Swagger):** [https://tasksphere.azurewebsites.net/api-docs](https://tasksphere.azurewebsites.net/api-docs)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
  - [Prerequisites](#prerequisites)
  - [1 — Clone the repo](#1--clone-the-repo)
  - [2 — Backend setup](#2--backend-setup)
  - [3 — Frontend setup](#3--frontend-setup)
- [Third-Party Package Choices](#third-party-package-choices)
- [CI/CD & Deployment](#cicd--deployment)
- [If I Had More Time](#if-i-had-more-time)

---

## Features

- **Authentication** — Register, login, and logout with JWT access tokens persisted across browser sessions
- **Task CRUD** — Create, view, edit, and delete tasks with title, description, type, status, priority, and due date
- **Quick status change** — Update task status directly from the task card without opening a modal
- **Task Type** — Freeform, auto-completing combobox that learns from your existing task types
- **Filtering & Sorting** — Multi-select status/priority filters and four sort options (newest, oldest, due date, priority)
- **Analytics** — Velocity line chart (weekly / monthly / yearly) and a status distribution doughnut chart filtered by priority
- **Calendar view** — Monthly calendar showing tasks plotted on their due dates
- **Page transitions** — Full-screen overlay animations between login and the main app via GSAP
- **Toast notifications** — Auto-dismissing success/error feedback for every mutation
- **Dark / Light theme** — Persisted preference with system default fallback
- **Responsive layout** — Collapsible sidebar drawer on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend runtime** | Node.js 22, NestJS 11 |
| **ORM** | Prisma 7 (prisma-client-js generator) |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Passport.js + `passport-jwt`, `@nestjs/jwt`, bcrypt |
| **Validation** | `class-validator` + `class-transformer` + NestJS `ValidationPipe` |
| **API Docs** | Swagger via `@nestjs/swagger` |
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Routing** | React Router DOM v7 |
| **Global state** | Redux Toolkit + `redux-persist` (auth only) |
| **Server state** | TanStack React Query v5 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion (component), GSAP (page transitions) |
| **Charts** | Chart.js v4 + `react-chartjs-2` |
| **Icons** | Heroicons v2 |
| **HTTP client** | Axios |
| **Backend deploy** | Azure App Service (Node 22 LTS) via GitHub Actions |
| **Frontend deploy** | GitHub Pages via GitHub Actions |

---

## Project Structure

```
VitaSoft-Task-Management/
├── .github/workflows/
│   ├── main_tasksphere.yml      # Backend CI/CD → Azure App Service
│   └── deploy-frontend.yml     # Frontend CI/CD → GitHub Pages
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # User + Task models, enums
│   ├── prisma.config.ts         # Prisma datasource config (reads DATABASE_URL)
│   ├── src/
│   │   ├── main.ts              # Bootstrap: ValidationPipe, CORS, Swagger
│   │   ├── app.module.ts        # Root module
│   │   ├── health.controller.ts # GET /health (unauthenticated, cold-start ping)
│   │   ├── auth/                # Register, login, JWT strategy & guard
│   │   ├── tasks/               # Task CRUD, split into two controllers
│   │   ├── prisma/              # Global PrismaService
│   │   └── common/              # Decorators, interfaces
│   └── .env.example
└── frontend/
    ├── public/
    │   ├── logo.svg
    │   └── 404.html             # GitHub Pages SPA redirect trick
    ├── index.html
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx              # Router (with basename), routes, health ping
    │   ├── api/                 # Axios instance + auth/task API functions
    │   ├── app/store.ts         # Redux store with redux-persist
    │   ├── features/            # auth slice, UI transition slice
    │   ├── hooks/               # useTasks, useTaskTypes (React Query)
    │   ├── context/             # ThemeContext, ToastContext
    │   ├── components/          # dashboard/, layout/, tasks/, ui/
    │   ├── pages/               # LoginPage, RegisterPage, DashboardPage, CalendarPage
    │   └── types/               # task.types.ts, auth.types.ts
    └── .env.example
```

---

## Running Locally

### Prerequisites

- **Node.js** v22 or later
- **npm** v10 or later
- A **PostgreSQL** database — the easiest way is a free [Supabase](https://supabase.com) project (connection string is all you need)

---

### 1 — Clone the repo

```bash
git clone https://github.com/NithishKumar2022020/VitaSoft-Task-Management.git
cd VitaSoft-Task-Management
```

---

### 2 — Backend setup

```bash
cd backend
```

**a) Install dependencies**

```bash
npm install
```

**b) Create your environment file**

```bash
cp .env.example .env
```

Open `backend/.env` and fill in the values:

```env
# Your Supabase (or any PostgreSQL) connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"

# Any long random string (used to sign JWT tokens)
JWT_SECRET="replace-with-a-strong-random-secret"

# Token expiry in seconds — 604800 = 7 days
JWT_EXPIRES_IN_SECONDS=604800

# Port to listen on
PORT=3000
```

**c) Generate the Prisma client and push the schema**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> If you just want to push the schema without a migration history (e.g. fresh Supabase project), use `npx prisma db push` instead.

**d) Start the development server**

```bash
npm run start:dev
```

The API is now running at **http://localhost:3000**
Swagger UI is available at **http://localhost:3000/api-docs**

---

### 3 — Frontend setup

Open a **new terminal** tab from the project root:

```bash
cd frontend
```

**a) Install dependencies**

```bash
npm install
```

**b) Create your environment file**

```bash
cp .env.example .env
```

Open `frontend/.env` and set the backend URL:

```env
VITE_API_URL=http://localhost:3000
```

**c) Start the development server**

```bash
npm run dev
```

The app is now running at **http://localhost:5173**

---

## Third-Party Package Choices

### Backend

| Package | Why |
|---|---|
| **NestJS** | Opinionated, modular framework that enforces separation of concerns (modules, services, controllers). Built-in dependency injection, pipes, and guards eliminate boilerplate for validation and auth. |
| **Prisma 7** | The safest ORM choice for TypeScript — the generated client is fully typed from the schema so every DB call is type-checked at compile time. |
| **Supabase (PostgreSQL)** | Managed PostgreSQL with a free tier, no infrastructure to maintain. Works as a standard connection string. |
| **@nestjs/jwt + passport-jwt** | The de-facto standard for stateless JWT auth in NestJS. `passport-jwt` handles token extraction and verification; `@nestjs/jwt` provides the signing helper. Keeps the auth layer thin and testable. |
| **bcrypt** | Industry-standard adaptive hashing for passwords. The salt rounds make brute-force attacks computationally expensive even if the database is compromised. |
| **class-validator + class-transformer** | Pair with NestJS's `ValidationPipe` to declaratively validate and transform incoming request bodies using decorators directly on DTO classes — no manual validation logic needed. |
| **@nestjs/swagger** | Generates interactive Swagger UI from NestJS decorators with zero extra maintenance cost. Useful for exploring and testing the API during development. |

### Frontend

| Package | Why |
|---|---|
| **Vite** | Dramatically faster than webpack for development (native ESM, no bundling on change). The `@tailwindcss/vite` plugin integrates Tailwind at the Vite layer, keeping the toolchain lean. |
| **React Query (TanStack)** | Handles all server state: caching, background refetching, loading/error states, and cache invalidation after mutations. Eliminates the need for manual `useEffect` + `useState` data-fetching patterns. Keeps Redux focused solely on auth. |
| **Redux Toolkit + redux-persist** | Redux Toolkit reduces Redux boilerplate significantly. `redux-persist` is used only for the auth slice so the user stays logged in across page refreshes without any backend session. |
| **React Router DOM v7** | The standard choice for client-side routing in React. Used with `basename={import.meta.env.BASE_URL}` to correctly support GitHub Pages project-page deployment under a subpath. |
| **Axios** | More ergonomic than `fetch` for request/response interceptors — the auth token injection and 401 auto-logout logic are cleanly centralised in one `axiosInstance.ts` file. |
| **Tailwind CSS v4** | Utility-first styling removes the need for a separate CSS file per component. V4's Vite plugin makes tree-shaking automatic. The `dark:` variant makes theming trivial. |
| **Framer Motion** | Declarative animation API for React — layout animations on task cards (`layoutId`), modal entrance/exit transitions, and list item fade-ins with minimal code. |
| **GSAP** | Used specifically for the full-screen page-transition overlay (login ↔ dashboard). GSAP's timeline control gives precise sequencing that is difficult to achieve with CSS transitions alone. |
| **Chart.js + react-chartjs-2** | Chart.js is the most widely supported charting library with no heavy dependencies. `react-chartjs-2` provides a thin React wrapper. The two charts (velocity line, status doughnut) required minimal configuration. |
| **Heroicons** | Official Tailwind Labs icon set — consistent style, tree-shakeable, ships as individual React components. No icon font or sprite setup required. |

---

## CI/CD & Deployment

### Backend → Azure App Service

Triggered on every push to `main`. The workflow:
1. Installs dependencies and generates the Prisma client
2. Compiles TypeScript (`nest build`)
3. Stages `dist/`, `package.json`, and a `node_modules.tar.gz` (preserving `.prisma/client/` which `npm ci --omit=dev` would destroy)
4. Deploys the package to Azure App Service via OIDC federated credentials (no stored secrets)

The startup command on Azure is set to `node dist/src/main` (NestJS compiles to `dist/src/` when `prisma.config.ts` sits at the project root, shifting TypeScript's `rootDir`).

### Frontend → GitHub Pages

Triggered on every push to `main` that touches `frontend/**`. The workflow:
1. Runs `npm install && npm run build` with `VITE_API_URL` injected from a GitHub Actions repository variable
2. Uploads the `frontend/dist` folder as a Pages artifact
3. Deploys via `actions/deploy-pages`

SPA routing on GitHub Pages is handled by a `404.html` redirect trick — unmatched paths are redirected to the index with the target path encoded in the query string, which `index.html` then restores using `history.replaceState` before React mounts.

---

## If I Had More Time

### Features I would add

- **Task ordering / drag-and-drop** — Manual reordering of tasks within a status group using a library like `@dnd-kit/core`
- **Recurring tasks** — A repeat cadence field (daily, weekly, monthly) that auto-creates the next occurrence on completion
- **Notifications / reminders** — Browser notifications or email reminders for tasks approaching their due date
- **Export** — Download tasks as CSV or PDF for reporting
