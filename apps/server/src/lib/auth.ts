
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { user } from "../db/schema/user";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || "",
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        fieldName: "role",
        unique: false,
      },
      onboard: {
        type: "number",
        required: true,
        input: false,
        fieldName: "onboard",
        unique: false,
      },
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;

export const getSession = async (req: Request): Promise<Session | null> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return session;
};

export const validateSession = async (req: Request): Promise<Session | null> => {
  const session = await getSession(req);
  if (!session) {
    throw new Error("Unauthorized", { cause: "No session" });
  }
  return session;
};