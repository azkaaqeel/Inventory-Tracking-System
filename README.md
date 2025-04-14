# Inventory-Tracking-System


This backend system is developed as part of the Bazaar Technologies engineering case study. For each stage, I have made branches. The current main reflects the progress made for Stage 3. This project is also available at: https://github.com/azkaaqeel/Inventory-Tracking-System



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


### Stage 3 – Scaling for Thousands of Stores

To support large-scale operations, I designed the system to be horizontally scalable, performant, and concurrency-safe.

#### 1. Stateless Architecture
All API routes are stateless. I use JWT-based authentication so that each request carries its own credentials. This allows the system to scale horizontally by simply adding more server instances without session management complexity.

#### 2. Caching Layer
I integrated `node-cache` to reduce redundant database reads for frequently requested inventory data. The implementation is simple but allows easy upgrades to distributed caching tools like Redis if needed in production.

#### 3. Asynchronous Processing
Stock movement logging is done asynchronously to prevent write delays on the main request thread. This prepares the system for event-driven patterns in the future (e.g., using Kafka or RabbitMQ).

#### 4. Request Throttling
I added `express-rate-limit` to control traffic spikes and abuse. It limits clients to a fixed number of requests per time window to protect backend stability.

#### 5. Database Optimization
The PostgreSQL schema enforces referential integrity using primary and foreign keys. I also use `ON CONFLICT` logic in upsert operations to ensure safe updates under concurrent access.

#### 6. Designed for Future Extensions
Although message queues and read-replicas were not implemented due to scope, the current design allows:
- Plug-in support for event queues (Kafka, RabbitMQ)
- Read-write DB separation for analytics/reporting
- Background workers for batch processing and audit reports

---

Note: Make sure PostgreSQL is running and `.env` contains DB credentials.

---


## Final Thoughts

I opted not to use separate microservices or queues due to project scope and case study constraints. The design, however, allows plug-in replacements for logging, queuing, caching, and auth in future.


---

## Author
Azka Aqeel  
Engineering Case Study - Bazaar Technologies (April 2025)

