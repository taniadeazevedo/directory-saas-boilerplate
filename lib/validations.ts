import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const listingStepOneSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80),
  categoryId: z.string().min(1, "Select a category"),
  tags: z.array(z.string()).max(6, "Maximum 6 tags"),
  websiteUrl: z.string().url("Must be a valid URL"),
});

export const listingStepTwoSchema = z.object({
  description: z.string().min(50, "Description must be at least 50 characters").max(5000),
  logoUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).max(6, "Maximum 6 images"),
});

export const listingStepThreeSchema = z.object({
  plan: z.enum(["BASIC", "FEATURED", "SPONSOR"]),
});

export const listingSchema = listingStepOneSchema
  .merge(listingStepTwoSchema)
  .merge(listingStepThreeSchema);

export type ListingInput = z.infer<typeof listingSchema>;

export const reviewSchema = z.object({
  listingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  price: z.enum(["free", "paid"]).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  badge: z.enum(["verified", "featured"]).optional(),
  view: z.enum(["grid", "list"]).optional(),
  sort: z.enum(["newest", "popular", "rating"]).optional(),
  page: z.coerce.number().min(1).optional(),
});
