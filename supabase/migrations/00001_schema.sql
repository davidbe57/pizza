-- Casa Tonio — Schéma Supabase

CREATE TABLE menu (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  image TEXT DEFAULT '',
  category TEXT DEFAULT '',
  allergens JSONB DEFAULT '[]',
  "pizzaOfMonth" BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hours (
  id SERIAL PRIMARY KEY,
  jour TEXT UNIQUE NOT NULL,
  midi TEXT DEFAULT '',
  soir TEXT DEFAULT '',
  ferme BOOLEAN DEFAULT false
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  date TEXT DEFAULT '',
  name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  commande TEXT DEFAULT '',
  slot TEXT DEFAULT '',
  type TEXT DEFAULT 'emporter',
  horaire TEXT DEFAULT '',
  status TEXT DEFAULT 'Nouveau',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL
);

CREATE TABLE slot_settings (
  id SERIAL PRIMARY KEY,
  jour TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  max_pizzas INTEGER DEFAULT 0,
  UNIQUE(jour, slot_time)
);

CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  source TEXT DEFAULT '',
  date TEXT DEFAULT '',
  text TEXT DEFAULT '',
  stars INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);
