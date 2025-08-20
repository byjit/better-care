import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { user } from "../db/schema";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  
  updateRole: protectedProcedure
    .input(z.object({
      role: z.enum(["patient", "doctor"])
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      await db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, userId));
      
      // Return updated user data
      const updatedUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      return updatedUser[0];
    }),
});