# KyoDB — Smart Database & Cloud Storage Manager
> **Tagline:** One Dashboard. All Your Data.

KyoDB is a unified, personal cloud platform for managing relational SQL databases (**TiDB Cloud**) and high-speed object storage (**Cloudflare R2**) through an intuitive, modern dashboard.

---

## 🏛 Architecture Overview

KyoDB is built with a hybrid storage model:
- **TiDB Cloud (Structured Relational Data):**
  - Logical SQL databases and tables
  - System metadata (`kyodb_system`)
  - Authentication, sessions, and audit logs
  - Query history and API key credentials
- **Cloudflare R2 (Object Storage):**
  - Media (images, videos, audio)
  - Documents (PDF, DOCX, XLSX)
  - Binary files and raw SQL dump backups
  - Direct-to-R2 pre-signed uploads (minimizing server memory and avoiding Vercel payload limits)

---

## 🚀 Tech Stack

- **Framework:** Nuxt 3 / Nuxt 4 (Vue 3 Composition API, TypeScript strict mode)
- **UI Engine:** Nuxt UI, Tailwind CSS, Lucide Icons
- **Database Engine:** `mysql2/promise` with TLS v1.2+ encryption
- **Storage SDK:** AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Authentication:** Argon2id password hashing (`@node-rs/argon2`), secure HTTP-only cookies, sliding-window rate limiting
- **Validation:** Zod schemas
- **Testing:** Vitest

---

## 📦 Directory Structure

```text
kyodb/
├── assets/                  # Tailwind & global stylesheets
├── components/              # Modular Vue components
│   ├── dashboard/           # Metrics cards, connection cards, activity lists
│   ├── database/            # Database management components (Phase 3)
│   ├── storage/             # Cloudflare R2 file explorer (Phase 4)
│   ├── projects/            # Multi-project views (Phase 2)
│   └── shared/              # Sidebar, Navbar, ConfirmDialogs
├── composables/             # Reusable Vue composables (useAuth, useSystemHealth)
├── layouts/                 # Default dashboard and auth layouts
├── middleware/              # Client-side route guards (auth.ts)
├── pages/                   # File-based routing
│   ├── login.vue            # Admin login & bootstrap wizard
│   ├── index.vue            # Main dashboard overview
│   ├── projects/            # Project manager
│   ├── databases/           # Database explorer
│   ├── storage/             # Cloud storage
│   ├── sql-editor/          # Monaco SQL Editor
│   ├── monitoring/          # Resource monitoring
│   └── settings/            # Settings & API keys
├── server/
│   ├── api/                 # Nitro API endpoints
│   ├── middleware/          # Server authentication & session guards
│   ├── services/            # Core business logic (DB, R2, Auth, Migrations, Audit)
│   ├── validators/          # Zod input schemas
│   └── utils/               # Argon2id crypto & session token utilities
├── database/
│   └── migrations/          # Idempotent SQL schema migrations
├── types/                   # TypeScript interfaces and shared types
├── tests/                   # Automated Vitest test suites
├── nuxt.config.ts           # Nuxt configuration & runtimeConfig
└── README.md
```

---

## 🛠 Local Setup & Running

### 1. Prerequisites
- Node.js >= 20 (Node.js LTS v26+ tested)
- npm >= 10

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your TiDB Cloud and Cloudflare R2 credentials when available.
*Note: KyoDB is designed to run locally even before credentials are provided, presenting clear connection status indicators without crashing.*

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Admin Bootstrap
On first launch, if no admin account exists, KyoDB automatically prompts you to initialize your master administrator credentials directly on the login screen.

---

## 🧪 Testing

To execute automated test suites (Argon2id crypto, session hashing, health checks):
```bash
npm test
```

To run a production build:
```bash
npm run build
```

---

## 🔒 Security Best Practices
- **Least Privilege:** Destructive actions against `kyodb_system` are forbidden in code.
- **Hashed Sessions:** Tokens are stored as SHA-256 hashes in database/memory; only random tokens are kept in HTTP-only cookies.
- **Argon2id:** Master passwords are protected using memory-hard Argon2id hashing.
- **Rate Limiting:** Protects admin login against brute-force attacks.
- **Direct-to-R2:** Browser connects to Cloudflare R2 via short-lived pre-signed URLs; master S3 credentials never reach client browsers.
