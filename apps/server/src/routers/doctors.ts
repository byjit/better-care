import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { user } from "../db/schema";
import { z } from "zod";

// Schema for doctor information that patients should see
export const publicDoctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  metadata: z.object({
    specialization: z.string(),
    experience: z.number().optional(),
  }),
});

export const doctorsRouter = router({
  getAllDoctors: publicProcedure.query(async () => {
    const doctors = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        metadata: user.metadata,
      })
      .from(user)
      .where(eq(user.role, "doctor"));

    // Filter and transform the data to only include patient-relevant information
    return doctors
      .filter(doctor => doctor.metadata && 'specialization' in doctor.metadata)
      .map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        image: doctor.image,
        metadata: {
          specialization: (doctor.metadata as any).specialization,
          experience: (doctor.metadata as any).experience,
        },
      }));
  }),
});
