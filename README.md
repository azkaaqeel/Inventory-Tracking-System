# Inventory-Tracking-System


This backend system is developed as part of the Bazaar Technologies engineering case study. For each stage, I have made branches. The current main reflects the progress made for Stage 3.


## Key Design Decisions

### 1. Evolution-Centric Architecture
I approached the project in **3 stages**, each mapped to a realistic growth phase:

- **Stage 1 (Single Store):**
  - Local JSON file used as mock storage (later deprecated).
  - Basic API support for stock-in, sell, and manual removal.

- **Stage 2 (Multi-Store):**
  - PostgreSQL relational database was introduced.
  - Store-specific inventory tracking with a centralized product catalog.
  - REST APIs with filtering and reporting.
  - Basic authentication and request throttling added.

- **Stage 3 (Scalable System):**
  - Cache layer (Node-Cache) added for real-time sync.
  - Asynchronous logging using a background task.
  - Horizontally scalable design using stateless routes.

### 2. Data Normalization
I followed a **3NF** relational structure to ensure:
- No duplication of product/store data.
- Referential integrity.
- Clean joinable structures.

### 3. Simplicity > Complexity
I consciously avoided overengineering and stuck with Node.js and PostgreSQL to keep the system light, testable, and easy to reason about.

## Database Schema (ERD)

**Entities:**
- `stores` (store details)
- `products` (global product catalog)
- `inventory` (store-product stock map)
- `stock_movements` (log of all IN, SELL, REMOVE)
- `users` (store owners or admin)

```
[stores] --< [inventory] >-- [products]
   |                            |
   |                            |
   `--< [stock_movements] >--'  
          |
         [users] (via FK: store_id)
```

---

## APIs Overview

### Core Inventory APIs
- `POST /stock-in` — Add stock to a store-product pair.
- `POST /sell` — Reduce stock after a sale.
- `POST /remove` — Manually remove stock.
- `GET /inventory?store_id=...&product_id=...` — Fetch inventory (with optional filters).
- `GET /stock-movements?store_id=...&type=...&date_from=...` — Filter logs.

### Auth APIs
- `POST /signup` — Register admin or store owner.
- `POST /login` — Get JWT access token.

---

## Security Features
- **Basic Auth** — Using JWT tokens.
- **Role-based Access Control** — Only relevant APIs accessible per user role.
- **Request Throttling** — To prevent abuse (via `express-rate-limit`).

---

## Scalability Features

| Concern              | Solution                        |
|---------------------|----------------------------------|
| Caching             | `node-cache` (TTL-based)         |
| Asynchronous writes | Background `logStockMovement()` |
| Rate-limiting       | `express-rate-limit`             |
| Stateless APIs      | All routes stateless + JWT       |
| DB integrity        | Foreign keys + ON CONFLICT merge|

---

## Local Setup

```bash
npm install
node app.js
```
Note: Make sure PostgreSQL is running and `.env` contains DB credentials.

---


## Final Thoughts

I opted not to use separate microservices or queues due to project scope and case study constraints. The design, however, allows plug-in replacements for logging, queuing, caching, and auth in future.


---

## Author
Azka Aqeel  
Engineering Case Study - Bazaar Technologies (April 2025)

