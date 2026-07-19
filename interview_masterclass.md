# FinTrack AI: Complete Project Narrative & Interview Preparation Masterclass

*This document is formatted in Print-Ready Markdown. To convert it to a PDF: Open this file in your editor (e.g. VS Code), right-click and select "Open Preview", then press `Ctrl + Shift + P` and choose "Markdown PDF: Export (pdf)" or print it directly using your browser.*

---

## 1. Project Chronology (What We Built From Start to Finish)

Here is the step-by-step narrative of how this application was engineered:

### Phase 1: Authentication & Security Foundation
*   **Goal**: Establish a highly secure authentication flow resistant to standard web vulnerabilities (XSS and CSRF).
*   **What We Did**:
    *   Set up the Express server (`app.js`, `server.js`) with security middleware (`helmet` for headers, `cors` for origin controls, and request size limits).
    *   Configured **structured logging using Winston** to track server events and errors.
    *   Designed a **centralized asynchronous error handling** wrapper (`AppError.js` and `error.middleware.js`) to capture operational failures and strip stack traces in production.
    *   Implemented **Dual-JWT Authentication**: Access token (short-lived, 15m) returned in JSON response to be stored in memory; Refresh token (long-lived, 7d) set in a signed, `httpOnly`, `secure`, `sameSite: 'strict'` cookie.
    *   Built the React frontend auth wrapper (`AuthContext.jsx`) and private Axios client (`useAxiosPrivate.js`) utilizing interceptors to capture expired tokens, silently refresh them, and retry requests.

### Phase 2: Transaction Ledger & Cloud Storage
*   **Goal**: Enable users to log financial items (incomes/expenses) and attach receipt files.
*   **What We Did**:
    *   Configured **Cloudinary SDK** integration for CDN-backed asset storage.
    *   Designed the Mongoose **Transaction Schema** with sorting compound indexes on `{ user: 1, date: -1 }`.
    *   Implemented **Multer memory storage middleware** to capture file buffers in-memory, avoiding slow local disk reads/writes.
    *   Exposed full CRUD API endpoints protected by authorization gates (ensuring users can only query, edit, or delete their own data).
    *   Created frontend views (`Transactions.jsx`, `TransactionTable.jsx`, `TransactionForm.jsx`) supporting paginated tables, search bars, category filters, and file attachments.

### Phase 3: Dynamic Budgets & Visual Alert System
*   **Goal**: Create calendar-month category budget limits that dynamically calculate spent balances.
*   **What We Did**:
    *   Created the **Budget Schema** utilizing Mongoose compound unique indexes on `{ user: 1, category: 1 }` to prevent duplicate limits for the same category.
    *   Wrote backend **MongoDB Aggregation Pipelines** using `$match` and `$group` operators to calculate total monthly category expenses on-the-fly.
    *   Developed the frontend **Budgets View** (`Budgets.jsx`, `BudgetProgress.jsx`) displaying progress bars that change color based on usage threshold bounds:
        *   `Spent < 80%`: Green (**On Track**).
        *   `Spent 80% to 99%`: Yellow (**Approaching Limit**).
        *   `Spent >= 100%`: Red with a pulsing badge (**Over Budget**).

### Phase 4: Analytics Dashboards & Charts
*   **Goal**: Aggregate and visualize cash flow metrics.
*   **What We Did**:
    *   Implemented an analytics aggregation service providing net balance, total income, total expenses, category expense breakdowns, and 6-month historical trends.
    *   Built the **Analytics Dashboard** (`Analytics.jsx`) utilizing **Recharts** to draw dynamic visual diagrams:
        *   **Pie Chart**: Interactive spending distribution splits by category.
        *   **Bar Chart**: Monthly side-by-side comparison of total income vs expenses.

### Phase 5: Gemini AI Receipt Scanning
*   **Goal**: Introduce automated receipt reading to eliminate manual typing.
*   **What We Did**:
    *   Installed the official `@google/generative-ai` SDK.
    *   Wrote the AI service (`ai.service.js`) using the **Gemini 3.5 Flash** model.
    *   Implemented **Gemini's Structured Outputs (JSON Schema)** feature. We passed a strict schema to the API, forcing the LLM to output a clean JSON object containing `amount`, `type`, `category`, `date`, and `description`.
    *   Connected the upload stream buffer base64 representation to the Gemini endpoint.
    *   Built the frontend **"Scan with AI"** button, which sends selected files to the backend and auto-fills all transaction form parameters with the AI's structured response.

---

## 2. File-by-File Codebase Audit (Every File Explained)

### Backend Components

#### Configuration Layer
*   [`backend/config/db.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/config/db.js): Handles Mongoose MongoDB connections, hooks event listeners (`connected`, `error`, `disconnected`), and logs database states.
*   [`backend/config/cloudinary.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/config/cloudinary.js): Configures the Cloudinary storage SDK credentials (`cloud_name`, `api_key`, `api_secret`).

#### Entry Points
*   [`backend/src/server.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/server.js): Server boot file. Loads `.env` variables, checks database connection, and listens on port 5000.
*   [`backend/src/app.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/app.js): Configures Express app middleware chains (`helmet`, `cors`, `cookie-parser`, `express.json`) and registers the main API router prefix.

#### Database Models
*   [`backend/src/models/user.model.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/models/user.model.js): Defines User collection rules. Includes pre-save hooks to hash passwords with `bcrypt` and instance methods to check passwords.
*   [`backend/src/models/transaction.model.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/models/transaction.model.js): Defines Transaction records. Enforces compound sorting indexes on `{ user: 1, date: -1 }`.
*   [`backend/src/models/budget.model.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/models/budget.model.js): Defines Budget rules. Enforces unique composite keys `{ user: 1, category: 1 }`.

#### Routing Layer
*   [`backend/src/routes/index.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/routes/index.js): Entry router registering namespaces (`/auth`, `/transactions`, `/budgets`, `/analytics`).
*   [`backend/src/routes/auth.routes.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/routes/auth.routes.js): Maps authentication endpoints (`/register`, `/login`, `/logout`, `/refresh-token`, `/me`).
*   [`backend/src/routes/transaction.routes.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/routes/transaction.routes.js): Registers CRUD transaction mappings, including the `/scan` multipart file upload route.
*   [`backend/src/routes/budget.routes.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/routes/budget.routes.js): Routes for setting, reading, and updating budgets.
*   [`backend/src/routes/analytics.routes.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/routes/analytics.routes.js): Exposes `/summary` metrics for charts.

#### Controller Layer
*   [`backend/src/controllers/auth.controller.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/controllers/auth.controller.js): Orchestrates user signup, login, cookie setting, and access token returns.
*   [`backend/src/controllers/transaction.controller.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/controllers/transaction.controller.js): Handles HTTP endpoints for CRUD transactions and receipt AI scanning requests.
*   [`backend/src/controllers/budget.controller.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/controllers/budget.controller.js): Triggers budget configurations and returns monthly consumption data.
*   [`backend/src/controllers/analytics.controller.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/controllers/analytics.controller.js): Resolves dashboard aggregate summaries.

#### Middleware Layer
*   [`backend/src/middlewares/auth.middleware.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/middlewares/auth.middleware.js): Validates incoming JWT headers, retrieves the user from MongoDB, and attaches them to `req.user`.
*   [`backend/src/middlewares/upload.middleware.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/middlewares/upload.middleware.js): Configures Multer storage parameters, limit rules, and allows only JPG, JPEG, PNG, and PDF files.
*   [`backend/src/middlewares/validation.middleware.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/middlewares/validation.middleware.js): Parses requests against Zod validator schemas, blocking invalid payloads before they reach controllers.
*   [`backend/src/middlewares/error.middleware.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/middlewares/error.middleware.js): Catches all server exceptions, formats error payloads, and hides stack traces in production.

#### Business Logic (Services)
*   [`backend/src/services/auth.service.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/services/auth.service.js): Formats JWT payload data and issues access/refresh tokens.
*   [`backend/src/services/transaction.service.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/services/transaction.service.js): Executes transaction CRUD operations and handles memory streams to Cloudinary.
*   [`backend/src/services/budget.service.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/services/budget.service.js): Runs MongoDB aggregation queries comparing spending limits against monthly expense sums.
*   [`backend/src/services/analytics.service.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/services/analytics.service.js): Aggregates total balances, category splits, and monthly cash flow averages.
*   [`backend/src/services/ai.service.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/services/ai.service.js): Convers image files to base64, invokes the Gemini 3.5 Flash API, and parses the structured JSON receipt data.

#### Utilities
*   [`backend/src/utils/AppError.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/utils/AppError.js): Operational error wrapper inheriting from the native `Error` class, marking status codes and flags.
*   [`backend/src/utils/asyncHandler.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/utils/asyncHandler.js): Wraps asynchronous Express route handlers to automatically catch errors and pass them to the error middleware without try-catch blocks.
*   [`backend/src/utils/logger.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/backend/src/utils/logger.js): Sets up Winston file and console logger transports.

---

### Frontend Components

*   [`frontend/src/App.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/App.jsx): Holds page routes, loading gates, and the Context AuthProvider.
*   [`frontend/src/index.css`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/index.css): Sets up custom Tailwind CSS v4 variables and custom glassmorphism components.
*   [`frontend/src/context/AuthContext.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/context/AuthContext.jsx): Tracks active user authentication state, tokens, and handles register/login/logout requests.
*   [`frontend/src/hooks/useAxiosPrivate.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/hooks/useAxiosPrivate.js): Axios interceptor configuration for token-refresh mechanics.
*   [`frontend/src/utils/currency.js`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/utils/currency.js): Currency formatter utility preset to Indian Rupees (`₹`) with `en-IN` formatting.

#### Reusable UI Components
*   [`frontend/src/components/UI/Button.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/components/UI/Button.jsx): Theme button component supporting outline, primary, secondary, and loading states.
*   [`frontend/src/components/UI/Input.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/components/UI/Input.jsx): Text and number forms input box displaying labels and validations.
*   [`frontend/src/components/UI/Card.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/components/UI/Card.jsx): Glassmorphism card container.
*   [`frontend/src/components/UI/Modal.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/components/UI/Modal.jsx): React Portals modal frame.
*   [`frontend/src/components/Feedback/Spinner.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/components/Feedback/Spinner.jsx): Overlay spinner screen.

#### Main Views (Pages)
*   [`frontend/src/pages/Login.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/pages/Login.jsx) / [`Register.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/pages/Register.jsx): Session entry screen layouts.
*   [`frontend/src/pages/Dashboard.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/pages/Dashboard.jsx): Home page displaying net balance metrics and navigational quick-links.
*   [`frontend/src/pages/Transactions.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/pages/Transactions.jsx): Ledger dashboard integrating tables, filters, and transaction forms.
*   [`frontend/src/pages/Budgets.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/pages/Budgets.jsx): Budget overview panels.
*   [`frontend/src/pages/Analytics.jsx`](file:///c:/Users/utika/OneDrive/Desktop/expense%20tracker/frontend/src/pages/Analytics.jsx): Chart reports dashboard.

---

## 3. 15 Core Technical Interview Questions & Answers

### Q1: Can you describe the high-level architecture of your application?
**Answer**: 
> "The project follows **Clean Layered Architecture** with a clear separation of concerns:
> *   **Frontend**: Built with React (Vite) and Tailwind CSS. It communicates with the backend via a private Axios client and tracks global auth using React Context.
> *   **Routing Layer**: Express routes that map paths to specific middleware pipelines (Auth checks, Zod validation, Multer parsing).
> *   **Controller Layer**: Handles incoming HTTP requests, validates parameters, and returns standardized JSON envelopes.
> *   **Service Layer (Core Business Logic)**: Where calculations, database mutations, and third-party integrations (Cloudinary, Gemini AI) reside.
> *   **Data Access Layer**: Mongoose schemas enforcing model rules and indexes.
>
> Decoupling logic this way makes the system easier to test, secure, and scale."

### Q2: What security measures did you implement for JWT storage, and why?
**Answer**:
> "Typical MERN tutorials store JWTs in `localStorage`, which is vulnerable to **XSS (Cross-Site Scripting)**. Storing them entirely in cookies can introduce vulnerability to **CSRF (Cross-Site Request Forgery)**.
> 
> To mitigate both, I implemented a **Dual-JWT silent refresh architecture**:
> 1.  The short-lived **Access Token** (15 mins) is sent in the HTTP response body and stored solely in **React memory (state)**.
> 2.  The long-lived **Refresh Token** (7 days) is sent in a signed cookie with the attributes `httpOnly: true`, `secure: true`, and `sameSite: 'strict'`.
> 
> Because the refresh cookie cannot be accessed via Javascript (due to `httpOnly`), XSS scripts cannot read it. Because `sameSite` is set to `strict`, cross-site requests cannot transmit it, preventing CSRF. On the frontend, Axios interceptors silently exchange the refresh cookie for a new memory access token whenever a API call triggers a 401 error."

### Q3: How do Axios Interceptors handle token expiration silently?
**Answer**:
> "I created a private Axios instance hook (`useAxiosPrivate.js`). It registers an **Interceptor Response Handler**. 
> 
> When a request fails, the interceptor checks if the response status is `401 Unauthorized` and if the request header lacks a retry flag. If true, the interceptor intercepts the request, calls the `/auth/refresh-token` endpoint to get a new access token, updates the React auth state, appends the new token to the original request headers, and retries the request transparently. The user never notices a session interruption."

### Q4: Why did you choose Multer's Memory Storage over Disk Storage?
**Answer**:
> "Disk storage writes incoming files to the server's local disk before uploading them to Cloudinary. Under heavy traffic, this creates disk I/O latency, consumes temp space, and requires cron jobs to clean up temp files.
> 
> I configured **Multer's memory storage engine** to hold files in RAM as buffer objects. We pipe this buffer directly into **Cloudinary's API write streams** asynchronously. The file never touches the server's local disk, which improves upload speed and simplifies resource management."

### Q5: How does your Gemini AI receipt parser extract data in valid JSON?
**Answer**:
> "I used the `@google/generative-ai` SDK and called the **Gemini 3.5 Flash** model. To ensure the LLM output matches my backend transaction schema without conversational chatter, I used the **Structured JSON Outputs** feature.
> 
> I defined a JSON schema defining `amount` (number), `type` (string enum), `category` (string enum), `date` (string), and `description` (string) and passed it to the `responseSchema` generation configuration. This forces Gemini's engine to return valid JSON that can be parsed directly with `JSON.parse()`."

### Q6: How do you handle file uploads alongside Zod request validation?
**Answer**:
> "File uploads are multipart form-data requests, not standard JSON. We must structure the routing order so that:
> 1.  **Multer** parses the request body first, extracting the file buffer and text fields.
> 2.  **Zod validation middleware** runs next, validating the text fields (amount, category, type) against the schema.
> 3.  The request is passed to the **Controller** only if both steps succeed.
> 
> If we ran Zod validation before Multer, the request body would be empty because raw multipart payloads cannot be read directly by Express body-parsers."

### Q7: Explain how you calculate monthly budget consumption on-the-fly.
**Answer**:
> "Storing calculated values like `spentAmount` on the Budget document can lead to sync errors if a user deletes or backdates transactions. 
> 
> I calculate spending dynamically using **MongoDB Aggregation Pipelines**:
> 1.  `$match`: Filters transactions matching the user's ID, type = 'expense', category, and transaction date within the current calendar month.
> 2.  `$group`: Groups the matched documents and uses the `$sum` operator on the `amount` field.
> 
> This approach ensures data is always accurate. To keep it fast, I indexed the transaction fields."

### Q8: What database indexes did you design, and why?
**Answer**:
> "I implemented two key index patterns:
> 1.  **Transaction Collection**: A compound index on `{ user: 1, date: -1 }`. Since transactions are queried per user and sorted chronologically, this index allows MongoDB to fetch and sort records in-memory without scanning the entire collection.
> 2.  **Budget Collection**: A compound unique index on `{ user: 1, category: 1 }`. This serves a dual purpose: it speeds up budget lookups and prevents a user from creating duplicate budget limits for the same category."

### Q9: How did you implement global error handling in Express?
**Answer**:
> "I decoupled error processing into:
> 1.  A custom **`AppError`** utility class that inherits from `Error`. It attaches a `statusCode` (e.g., 400, 404) and sets `isOperational = true` (identifying expected user errors like bad input).
> 2.  An **`asyncHandler`** helper to catch rejected promises in controllers and forward them to the next handler automatically.
> 3.  A **Global Error Middleware** at the end of the Express application pipeline. In development, it returns the full stack trace. In production, it strips the stack trace to prevent data exposure and logs unexpected errors to Winston."

### Q10: How did you implement currency formatting globally?
**Answer**:
> "I created a central utility file `currency.js` containing `formatCurrency()`, which utilizes JavaScript's native **`Intl.NumberFormat`** API.
> 
> By utilizing this helper across all React views rather than hardcoding symbols (like `$`), I was able to change the entire application from USD (`$`) to Indian Rupees (`₹`) formatted in the Indian numbering style (`en-IN` lakhs/crores format) in a single step."

### Q11: What would you do if your database queries started slowing down?
**Answer**:
> "I would follow a structured troubleshooting process:
> 1.  Use MongoDB's `.explain('executionStats')` method on slow queries to see if they are performing collection scans (COLLSCAN) instead of index scans (IXSCAN).
> 2.  Verify compound index coverage for the query's filter and sort fields.
> 3.  If memory limit issues occur during sorting, ensure the index order matches the query sort direction.
> 4.  Implement pagination (using skip/limit with cursor-based keys) to avoid loading massive arrays into server memory."

### Q12: Why did you use React Portals for your Modals?
**Answer**:
> "Modals rendered nested inside the DOM hierarchy can inherit styles like `overflow: hidden`, `z-index`, or `transform` from parent divs, causing layout clipping.
> 
> By using **React Portals** (`createPortal`), I rendered the modal overlay directly under the document `<body>` element. This keeps it independent of the parent component's styles while maintaining React state and lifecycle bindings."

### Q13: If a user deletes a transaction, how do you handle the attached Cloudinary file?
**Answer**:
> "In the transaction service layer, when `deleteTransaction` is called, the database document is fetched first. If the transaction has a `receipt.publicId` field, the service triggers an asynchronous call to `cloudinary.uploader.destroy(publicId)`. Once the asset is removed from the CDN, the transaction document is removed from MongoDB. This prevents orphaned files from taking up cloud space."

### Q14: How does your frontend handle responsiveness?
**Answer**:
> "The layouts are styled using **Tailwind CSS v4**'s utility-first mobile-responsive rules. I used standard responsive grid systems and flex wrappers:
> *   The table collapses into card lists on mobile screens.
> *   Sidebar navigations transition into slide-out overlays.
> *   The dashboard metrics grid uses CSS Grid layout: `grid-cols-1 md:grid-cols-3`."

### Q15: If you had to scale this app to 10,000 active users, what is the first thing you'd change?
**Answer**:
> "I would focus on the following:
> 1.  **Rate Limiting**: Add `express-rate-limit` to authentication and AI scan endpoints to prevent server overload.
> 2.  **Caching**: Implement a Redis cache for dashboard summaries and budget aggregates, invalidating the cache when a transaction is added, updated, or deleted.
> 3.  **Database Scaling**: Introduce read-replicas for MongoDB to handle read queries and shard the collections using `user` as the shard key."
