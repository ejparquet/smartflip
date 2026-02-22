import { sql } from "drizzle-orm";
import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["homeowner", "professional"] }).notNull(),
  professionalType: text("professional_type"),
  avatar: text("avatar"),
  phone: text("phone"),
  zipCode: text("zip_code"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  city: text("city"),
  state: text("state"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const taxAuctions = sqliteTable("tax_auctions", {
  id: text("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  parcelId: text("parcel_id").notNull(),
  owedAmount: real("owed_amount").notNull(),
  assessedValue: real("assessed_value").notNull(),
  marketValue: real("market_value").notNull(),
  propertyType: text("property_type", { 
    enum: ["single_family", "multi_family", "commercial", "land", "condo"] 
  }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: real("bathrooms"),
  sqft: integer("sqft"),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  auctionDate: text("auction_date").notNull(),
  auctionTime: text("auction_time").notNull(),
  auctionLocation: text("auction_location").notNull(),
  startingBid: real("starting_bid").notNull(),
  status: text("status", { 
    enum: ["upcoming", "active", "sold", "cancelled"] 
  }).notNull().default("upcoming"),
  image: text("image"),
  county: text("county").notNull(),
  taxYearsOwed: text("tax_years_owed"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  registrationDeadline: text("registration_deadline"),
  depositRequired: real("deposit_required"),
  description: text("description"),
  sourceApi: text("source_api"),
  externalId: text("external_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  propertyType: text("property_type", { 
    enum: ["single_family", "multi_family", "commercial", "land", "condo"] 
  }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: real("bathrooms"),
  sqft: integer("sqft"),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  purchasePrice: real("purchase_price"),
  currentValue: real("current_value"),
  status: text("status", { 
    enum: ["owned", "for_sale", "under_contract", "sold"] 
  }).notNull().default("owned"),
  image: text("image"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const savedAuctions = sqliteTable("saved_auctions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  auctionId: text("auction_id").notNull().references(() => taxAuctions.id),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const auctionBids = sqliteTable("auction_bids", {
  id: text("id").primaryKey(),
  auctionId: text("auction_id").notNull().references(() => taxAuctions.id),
  userId: text("user_id").notNull().references(() => users.id),
  bidAmount: real("bid_amount").notNull(),
  status: text("status", { 
    enum: ["pending", "accepted", "outbid", "won", "lost"] 
  }).notNull().default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const marketplaceListings = sqliteTable("marketplace_listings", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", { 
    enum: ["tile", "wood", "cabinets", "fixtures", "appliances", "flooring", "paint", "lighting", "hardware", "other"] 
  }).notNull(),
  condition: text("condition", { 
    enum: ["new", "like_new", "good", "fair"] 
  }).notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").default("each"),
  images: text("images"),
  location: text("location"),
  zipCode: text("zip_code"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isSold: integer("is_sold", { mode: "boolean" }).default(false),
  originalProject: text("original_project"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TaxAuction = typeof taxAuctions.$inferSelect;
export type NewTaxAuction = typeof taxAuctions.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type SavedAuction = typeof savedAuctions.$inferSelect;
export type AuctionBid = typeof auctionBids.$inferSelect;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
