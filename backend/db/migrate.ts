import { getDb } from "./index";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  const db = getDb();
  
  console.log("Running database migrations...");

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('homeowner', 'professional')),
      professional_type TEXT,
      avatar TEXT,
      phone TEXT,
      zip_code TEXT,
      latitude REAL,
      longitude REAL,
      city TEXT,
      state TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tax_auctions (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      parcel_id TEXT NOT NULL,
      owed_amount REAL NOT NULL,
      assessed_value REAL NOT NULL,
      market_value REAL NOT NULL,
      property_type TEXT NOT NULL CHECK (property_type IN ('single_family', 'multi_family', 'commercial', 'land', 'condo')),
      bedrooms INTEGER,
      bathrooms REAL,
      sqft INTEGER,
      lot_size TEXT,
      year_built INTEGER,
      auction_date TEXT NOT NULL,
      auction_time TEXT NOT NULL,
      auction_location TEXT NOT NULL,
      starting_bid REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'sold', 'cancelled')),
      image TEXT,
      county TEXT NOT NULL,
      tax_years_owed TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      registration_deadline TEXT,
      deposit_required REAL,
      description TEXT,
      source_api TEXT,
      external_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id),
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      property_type TEXT NOT NULL CHECK (property_type IN ('single_family', 'multi_family', 'commercial', 'land', 'condo')),
      bedrooms INTEGER,
      bathrooms REAL,
      sqft INTEGER,
      lot_size TEXT,
      year_built INTEGER,
      purchase_price REAL,
      current_value REAL,
      status TEXT NOT NULL DEFAULT 'owned' CHECK (status IN ('owned', 'for_sale', 'under_contract', 'sold')),
      image TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS saved_auctions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      auction_id TEXT NOT NULL REFERENCES tax_auctions(id),
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS auction_bids (
      id TEXT PRIMARY KEY,
      auction_id TEXT NOT NULL REFERENCES tax_auctions(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      bid_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'outbid', 'won', 'lost')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('tile', 'wood', 'cabinets', 'fixtures', 'appliances', 'flooring', 'paint', 'lighting', 'hardware', 'other')),
      condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit TEXT DEFAULT 'each',
      images TEXT,
      location TEXT,
      zip_code TEXT,
      latitude REAL,
      longitude REAL,
      is_sold INTEGER DEFAULT 0,
      original_project TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tax_auctions_location ON tax_auctions(latitude, longitude)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tax_auctions_status ON tax_auctions(status)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tax_auctions_date ON tax_auctions(auction_date)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_saved_auctions_user ON saved_auctions(user_id)`);

  console.log("Migrations completed successfully");
}
