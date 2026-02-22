import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { taxAuctionsRouter } from "./routes/taxAuctions";
import { propertiesRouter, marketplaceRouter, usersRouter } from "./routes/properties";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  taxAuctions: taxAuctionsRouter,
  properties: propertiesRouter,
  marketplace: marketplaceRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
