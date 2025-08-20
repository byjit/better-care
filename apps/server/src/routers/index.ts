import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { authRouter } from "./auth";
import { doctorsRouter } from "./doctors";

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
  doctors: doctorsRouter,
});
export type AppRouter = typeof appRouter;
