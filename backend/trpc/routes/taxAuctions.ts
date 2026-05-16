import { z } from "zod";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { taxAuctions, savedAuctions, auctionBids } from "../../db/schema";
import { realEstateApi } from "../../services/realEstateApi";
import { runMigrations } from "../../db/migrate";

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const taxAuctionsRouter = createTRPCRouter({
  initDatabase: publicProcedure.mutation(async () => {
    await runMigrations();
    return { success: true, message: "Database initialized" };
  }),

  getAll: publicProcedure
    .input(
      z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().default(50),
        status: z.enum(["upcoming", "active", "sold", "cancelled"]).optional(),
        propertyType: z.enum(["single_family", "multi_family", "commercial", "land", "condo"]).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        county: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("Fetching tax auctions with params:", input);

      let query = ctx.db.select().from(taxAuctions).$dynamic();

      if (input.status) {
        query = query.where(eq(taxAuctions.status, input.status));
      }

      if (input.propertyType) {
        query = query.where(eq(taxAuctions.propertyType, input.propertyType));
      }

      if (input.minPrice) {
        query = query.where(gte(taxAuctions.startingBid, input.minPrice));
      }

      if (input.maxPrice) {
        query = query.where(lte(taxAuctions.startingBid, input.maxPrice));
      }

      if (input.county) {
        query = query.where(eq(taxAuctions.county, input.county));
      }

      const results = await query.limit(input.limit).offset(input.offset);

      if (input.latitude && input.longitude) {
        const R = 3959;
        const lat = input.latitude;
        const lon = input.longitude;
        const radiusMiles = input.radiusMiles;
        
        return results
          .map((auction) => {
            const dLat = ((auction.latitude - lat) * Math.PI) / 180;
            const dLon = ((auction.longitude - lon) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat * Math.PI) / 180) *
                Math.cos((auction.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return { ...auction, distance };
          })
          .filter((auction) => auction.distance <= radiusMiles)
          .sort((a, b) => a.distance - b.distance);
      }

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(taxAuctions)
        .where(eq(taxAuctions.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        parcelId: z.string(),
        owedAmount: z.number(),
        assessedValue: z.number(),
        marketValue: z.number(),
        propertyType: z.enum(["single_family", "multi_family", "commercial", "land", "condo"]),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        sqft: z.number().optional(),
        lotSize: z.string().optional(),
        yearBuilt: z.number().optional(),
        auctionDate: z.string(),
        auctionTime: z.string(),
        auctionLocation: z.string(),
        startingBid: z.number(),
        status: z.enum(["upcoming", "active", "sold", "cancelled"]).optional(),
        image: z.string().optional(),
        county: z.string(),
        taxYearsOwed: z.array(z.number()).optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
        registrationDeadline: z.string().optional(),
        depositRequired: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      
      await ctx.db.insert(taxAuctions).values({
        id,
        ...input,
        taxYearsOwed: input.taxYearsOwed ? JSON.stringify(input.taxYearsOwed) : null,
        status: input.status || "upcoming",
      });

      return { id, success: true };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          status: z.enum(["upcoming", "active", "sold", "cancelled"]).optional(),
          startingBid: z.number().optional(),
          auctionDate: z.string().optional(),
          auctionTime: z.string().optional(),
          description: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(taxAuctions)
        .set({
          ...input.data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(taxAuctions.id, input.id));

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(taxAuctions).where(eq(taxAuctions.id, input.id));
      return { success: true };
    }),

  saveAuction: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        auctionId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      
      await ctx.db.insert(savedAuctions).values({
        id,
        userId: input.userId,
        auctionId: input.auctionId,
        notes: input.notes,
      });

      return { id, success: true };
    }),

  unsaveAuction: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        auctionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(savedAuctions)
        .where(
          and(
            eq(savedAuctions.userId, input.userId),
            eq(savedAuctions.auctionId, input.auctionId)
          )
        );

      return { success: true };
    }),

  getSavedAuctions: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const saved = await ctx.db
        .select({
          savedAuction: savedAuctions,
          auction: taxAuctions,
        })
        .from(savedAuctions)
        .innerJoin(taxAuctions, eq(savedAuctions.auctionId, taxAuctions.id))
        .where(eq(savedAuctions.userId, input.userId));

      return saved.map((s) => ({
        ...s.auction,
        savedAt: s.savedAuction.createdAt,
        notes: s.savedAuction.notes,
      }));
    }),

  placeBid: publicProcedure
    .input(
      z.object({
        auctionId: z.string(),
        userId: z.string(),
        bidAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      
      await ctx.db.insert(auctionBids).values({
        id,
        auctionId: input.auctionId,
        userId: input.userId,
        bidAmount: input.bidAmount,
        status: "pending",
      });

      return { id, success: true };
    }),

  getBids: publicProcedure
    .input(z.object({ auctionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const bids = await ctx.db
        .select()
        .from(auctionBids)
        .where(eq(auctionBids.auctionId, input.auctionId))
        .orderBy(sql`${auctionBids.bidAmount} DESC`);

      return bids;
    }),

  syncFromApi: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusMiles: z.number().default(50),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Syncing auctions from external API...");

      const externalAuctions = await realEstateApi.searchTaxAuctions({
        latitude: input.latitude,
        longitude: input.longitude,
        radiusMiles: input.radiusMiles,
        state: input.state,
      });

      let insertedCount = 0;

      for (const auction of externalAuctions) {
        const existing = await ctx.db
          .select()
          .from(taxAuctions)
          .where(eq(taxAuctions.externalId, auction.id))
          .limit(1);

        if (existing.length === 0) {
          await ctx.db.insert(taxAuctions).values({
            id: generateId(),
            address: auction.address,
            city: auction.city,
            state: auction.state,
            zipCode: auction.zipCode,
            latitude: auction.latitude,
            longitude: auction.longitude,
            parcelId: auction.parcelId,
            owedAmount: auction.owedAmount,
            assessedValue: auction.assessedValue,
            marketValue: auction.marketValue,
            propertyType: auction.propertyType,
            bedrooms: auction.bedrooms,
            bathrooms: auction.bathrooms,
            sqft: auction.sqft,
            lotSize: auction.lotSize,
            yearBuilt: auction.yearBuilt,
            auctionDate: auction.auctionDate,
            auctionTime: auction.auctionTime,
            auctionLocation: auction.auctionLocation,
            startingBid: auction.startingBid,
            status: auction.status,
            image: auction.image,
            county: auction.county,
            taxYearsOwed: JSON.stringify(auction.taxYearsOwed),
            contactPhone: auction.contactPhone,
            contactEmail: auction.contactEmail,
            registrationDeadline: auction.registrationDeadline,
            depositRequired: auction.depositRequired,
            description: auction.description,
            sourceApi: "attom",
            externalId: auction.id,
          });
          insertedCount++;
        }
      }

      return {
        success: true,
        message: `Synced ${insertedCount} new auctions from API`,
        totalFetched: externalAuctions.length,
        newInserted: insertedCount,
      };
    }),
});
