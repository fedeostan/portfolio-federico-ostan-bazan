import { z } from "zod";

export const leadSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
