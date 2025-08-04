import { DEFAULT_LIMIT } from "@/constants";
import { z } from "zod";

export const createLaunchpadSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description too long"),
    content: z.any().optional(), // Rich text content
    image: z.string().min(1, "Image is required"),
    originalPrice: z
      .number()
      .min(0.01, "Original price must be greater than 0"),
    launchPrice: z.number().min(0.01, "Launch price must be greater than 0"),
    duration: z
      .number()
      .min(0.01, "Duration must be at least 1 hour")
      .max(720, "Duration too long"),
    category: z.string().min(1, "Category is required"),
    tags: z.array(z.string()).optional(),
    refundPolicy: z.string().optional(),
  })
  .refine((data) => data.launchPrice < data.originalPrice, {
    message: "Launch price must be less than original price",
    path: ["launchPrice"],
  });

export const updateLaunchpadSchema = createLaunchpadSchema.partial();

export const getLaunchpadsSchema = z.object({
  cursor: z.number().default(1),
  limit: z.number().default(DEFAULT_LIMIT),
  search: z.string().optional(),
  sort: z.enum(["priority", "newest", "ending-soon"]).default("priority"),
});

export const getLaunchpadSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const approveLaunchpadSchema = z.object({
  id: z.string().min(1, "ID is required"),
  priority: z.number().optional(),
});

export const rejectLaunchpadSchema = z.object({
  id: z.string().min(1, "ID is required"),
  reason: z.string().min(1, "Rejection reason is required"),
});

export const publishLaunchpadSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const purchaseLaunchpadSchema = z.object({
  launchpadId: z.string().min(1, "Launchpad ID is required"),
});

export type CreateLaunchpadInput = z.infer<typeof createLaunchpadSchema>;
export type UpdateLaunchpadInput = z.infer<typeof updateLaunchpadSchema>;
export type GetLaunchpadsInput = z.infer<typeof getLaunchpadsSchema>;
export type GetLaunchpadInput = z.infer<typeof getLaunchpadSchema>;
export type ApproveLaunchpadInput = z.infer<typeof approveLaunchpadSchema>;
export type RejectLaunchpadInput = z.infer<typeof rejectLaunchpadSchema>;
export type PublishLaunchpadInput = z.infer<typeof publishLaunchpadSchema>;
export type PurchaseLaunchpadInput = z.infer<typeof purchaseLaunchpadSchema>;
