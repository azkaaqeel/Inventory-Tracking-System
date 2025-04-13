-- ================================
-- SCHEMA: Inventory Tracking System
-- ================================

-- ================================
-- Table: stores
-- ================================



CREATE TABLE IF NOT EXISTS public.stores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- Table: products
-- ================================

CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- Table: inventory
-- ================================

CREATE TABLE IF NOT EXISTS public.inventory (
    store_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (store_id, product_id),
    FOREIGN KEY (store_id) REFERENCES public.stores(id),
    FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- ================================
-- Table: stock_movements
-- ================================

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES public.stores(id),
    product_id INTEGER REFERENCES public.products(id),
    type TEXT CHECK (type IN ('IN', 'SELL', 'REMOVE')),
    quantity INTEGER NOT NULL,
    "timestamp" TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'store_owner')) NOT NULL,
  store_id INTEGER REFERENCES stores(id)
);
