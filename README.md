# FinTrack AI

A full-stack, production-ready personal finance tracker built on the MERN stack. Features secure JWT cookie authentication, real-time transaction ledger management, in-memory Cloudinary file uploads for receipts, dynamic monthly budget tracking with visual warnings, and a live reporting dashboard utilizing Recharts.

Additionally, the project integrates the **Google Gemini 3.5 Flash** model to parse uploaded receipt images and PDFs, automatically pre-filling transactions to reduce manual entry.

---

## Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS (v4), React Router, Axios, Recharts, Lucide-React.
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose), Zod (Validation), Winston (Logging).
*   **Storage & AI**: Cloudinary SDK (Receipts), Google Generative AI SDK (Gemini 3.5 Flash).
*   **Testing**: Jest, Supertest.

---

## Core Features

1.  **Dual-JWT Authentication**: Access tokens are kept in memory (XSS protection), and refresh tokens are stored in signed, HTTP-Only SameSite cookies (CSRF protection) with silent-refresh Axios interceptors.
2.  **AI Receipt Scanning**: Users can upload receipt images or PDFs. Gemini processes the document buffers in memory (no disk I/O latency) and extracts structured transaction metadata using a strict JSON schema.
3.  **Visual Budgets & Alerts**: Automatic calculation of category-wise expenditures for the calendar month compared to user limits, triggering dynamic alert indicators (emerald/amber/red).
4.  **Interactive Dashboards**: Monthly cash flow comparison charts (bar) and category percentage spending breakdowns (donut/pie).

---

## Folder Structure

```text
├── backend/
│   ├── config/             # DB & Cloudinary SDK configurations
│   ├── src/
│   │   ├── controllers/    # Express controllers (request/response orchestration)
│   │   ├── middlewares/    # Auth gates, validations, upload controls, error handlers
│   │   ├── models/         # Mongoose schema definitions (User, Transaction, Budget)
│   │   ├── routes/         # API endpoint definitions
│   │   ├── services/       # Core business logic (auth, transactions, budgets, AI)
│   │   └── utils/          # Winston logging, operational error classes, async wrappers
│   ├── tests/              # Jest integration testing suites
│   └── .env.example        # Environment variable blueprint
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable global UI atoms (buttons, inputs, cards, portals)
│   │   ├── context/        # Session AuthContext
│   │   ├── features/       # Feature-specific structures (forms, lists, progress bars)
│   │   ├── hooks/          # Axios private interceptor hooks
│   │   ├── pages/          # Main page layouts (Dashboard, Ledger, Budgets, Analytics)
│   │   └── services/       # Client API request controllers
│   └── index.html
```

---

## Installation & Running Locally

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** installed and running on your system.

### 2. Setup Configuration
Clone the repository and copy the environment template in the backend directory:
```bash
cd backend
cp .env.example .env
```
Fill in the `.env` parameters with your details:
*   `MONGODB_URI` (Your local or Atlas database connection string)
*   `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET` (Secure random strings)
*   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
*   `GEMINI_API_KEY` (Generated from Google AI Studio)

### 3. Install Dependencies
Run the installation script from the root workspace folder:
```bash
npm install
```

### 4. Run Development Servers
Start both the React client and Express backend concurrently:
```bash
npm run dev
```
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Backend**: [http://localhost:5000](http://localhost:5000)

### 5. Running Tests
To run the automated backend test suites:
```bash
cd backend
npm run test
```

---

## Future Improvements & TODOs
*   [ ] Add CSV/XLSX export for ledger records.
*   [ ] Implement recurring automatic transactions (e.g. subscriptions).
*   [ ] Build multi-currency localization conversion rates.
*   [ ] Support email/password reset flow via nodemailer.
