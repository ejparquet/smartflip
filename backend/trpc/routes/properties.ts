import { z } from "zod";
import { eq, gte, lte } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { properties, marketplaceListings, users } from "../../db/schema";
import { realEstateApi } from "../../services/realEstateApi";

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const propertiesQueryInput = z.object({
  ownerId: z.string().optional(),
  status: z.enum(["owned", "for_sale", "under_contract", "sold"]).optional(),
  propertyType: z.enum(["single_family", "multi_family", "commercial", "land", "condo"]).optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

const marketplaceQueryInput = z.object({
  category: z.enum(["tile", "wood", "cabinets", "fixtures", "appliances", "flooring", "paint", "lighting", "hardware", "other"]).optional(),
  condition: z.enum(["new", "like_new", "good", "fair"]).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusMiles: z.number().default(25),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const propertiesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(propertiesQueryInput)
    .query(async ({ ctx, input }) => {
      let query = ctx.db.select().from(properties).$dynamic();

      if (input.ownerId) {
        query = query.where(eq(properties.ownerId, input.ownerId));
      }

      if (input.status) {
        query = query.where(eq(properties.status, input.status));
      }

      if (input.propertyType) {
        query = query.where(eq(properties.propertyType, input.propertyType));
      }

      return await query.limit(input.limit).offset(input.offset);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(properties)
        .where(eq(properties.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        ownerId: z.string().optional(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        propertyType: z.enum(["single_family", "multi_family", "commercial", "land", "condo"]),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        sqft: z.number().optional(),
        lotSize: z.string().optional(),
        yearBuilt: z.number().optional(),
        purchasePrice: z.number().optional(),
        currentValue: z.number().optional(),
        status: z.enum(["owned", "for_sale", "under_contract", "sold"]).optional(),
        image: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      
      await ctx.db.insert(properties).values({
        id,
        ...input,
        status: input.status || "owned",
      });

      return { id, success: true };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          status: z.enum(["owned", "for_sale", "under_contract", "sold"]).optional(),
          currentValue: z.number().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(properties)
        .set({
          ...input.data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(properties.id, input.id));

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(properties).where(eq(properties.id, input.id));
      return { success: true };
    }),

  searchExternal: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusMiles: z.number().default(10),
        propertyType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const results = await realEstateApi.searchProperties({
        latitude: input.latitude,
        longitude: input.longitude,
        radiusMiles: input.radiusMiles,
        propertyType: input.propertyType,
      });

      return results;
    }),

  getPropertyDetails: publicProcedure
    .input(
      z.object({
        address: z.string(),
        zipCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      const details = await realEstateApi.getPropertyDetails(input.address, input.zipCode);
      return details;
    }),
});

export const marketplaceRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(marketplaceQueryInput)
    .query(async ({ ctx, input }) => {
      let query = ctx.db.select().from(marketplaceListings).$dynamic();

      query = query.where(eq(marketplaceListings.isSold, false));

      if (input.category) {
        query = query.where(eq(marketplaceListings.category, input.category));
      }

      if (input.condition) {
        query = query.where(eq(marketplaceListings.condition, input.condition));
      }

      if (input.minPrice) {
        query = query.where(gte(marketplaceListings.price, input.minPrice));
      }

      if (input.maxPrice) {
        query = query.where(lte(marketplaceListings.price, input.maxPrice));
      }

      const results = await query.limit(input.limit).offset(input.offset);

      if (input.latitude && input.longitude) {
        const R = 3959;
        const radiusMiles = input.radiusMiles;
        const lat = input.latitude;
        const lon = input.longitude;
        
        return results
          .filter((listing) => listing.latitude && listing.longitude)
          .map((listing) => {
            const dLat = ((listing.latitude! - lat) * Math.PI) / 180;
            const dLon = ((listing.longitude! - lon) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat * Math.PI) / 180) *
                Math.cos((listing.latitude! * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return { ...listing, distance };
          })
          .filter((listing) => listing.distance <= radiusMiles)
          .sort((a, b) => a.distance - b.distance);
      }

      return results;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        sellerId: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.enum(["tile", "wood", "cabinets", "fixtures", "appliances", "flooring", "paint", "lighting", "hardware", "other"]),
        condition: z.enum(["new", "like_new", "good", "fair"]),
        price: z.number(),
        quantity: z.number().default(1),
        unit: z.string().default("each"),
        images: z.array(z.string()).optional(),
        location: z.string().optional(),
        zipCode: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        originalProject: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      
      await ctx.db.insert(marketplaceListings).values({
        id,
        ...input,
        images: input.images ? JSON.stringify(input.images) : null,
      });

      return { id, success: true };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          price: z.number().optional(),
          quantity: z.number().optional(),
          description: z.string().optional(),
          isSold: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(marketplaceListings)
        .set({
          ...input.data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(marketplaceListings.id, input.id));

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(marketplaceListings).where(eq(marketplaceListings.id, input.id));
      return { success: true };
    }),

  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.sellerId, input.userId));
    }),
});

export const usersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()))
        .limit(1);

      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        role: z.enum(["homeowner", "professional"]),
        professionalType: z.string().optional(),
        avatar: z.string().optional(),
        phone: z.string().optional(),
        zipCode: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId();
      
      await ctx.db.insert(users).values({
        id,
        ...input,
        email: input.email.toLowerCase(),
      });

      return { id, success: true };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          avatar: z.string().optional(),
          phone: z.string().optional(),
          zipCode: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set(input.data)
        .where(eq(users.id, input.id));

      return { success: true };
    }),
});
