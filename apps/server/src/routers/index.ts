import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { authRouter } from "./auth";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  auth: authRouter,
});
export type AppRouter = typeof appRouter;
