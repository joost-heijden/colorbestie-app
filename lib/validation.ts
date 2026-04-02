import { z } from "zod";

export const planSchema = z.enum(["monthly", "yearly", "lifetime"]);

const markerSelectionSchema = z.object({
  brand: z.string().min(1),
  series: z.string().min(1),
  setSize: z.string().min(1),
  extraColors: z.array(z.string().min(1).max(12)).max(3).optional(),
});

export const stripeCheckoutBodySchema = z.object({
  plan: planSchema,
  markerSelection: markerSelectionSchema.optional(),
  markerSelections: z.array(markerSelectionSchema).optional(),
});

export const uploadUrlBodySchema = z.object({
  contentType: z.enum(["image/png", "image/jpeg"]),
});

export const generateBodySchema = z.object({
  uploadPath: z.string().min(1),
  theme: z.string().min(1).max(120),
  specialWishes: z.string().max(120).optional(),
  markerSelections: z.array(markerSelectionSchema).optional(),
  inlineImageBase64: z.string().min(1).optional(),
  inlineImageMimeType: z.enum(["image/png", "image/jpeg"]).optional(),
});

export type Plan = z.infer<typeof planSchema>;
