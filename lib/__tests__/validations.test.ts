import { describe, expect, it } from "vitest";
import { listingSchema, loginSchema, registerSchema, reviewSchema, searchParamsSchema } from "@/lib/validations";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
    expect(result.success).toBe(false);
  });
});

describe("listingSchema", () => {
  const valid = {
    title: "My Tool",
    categoryId: "cat_1",
    tags: ["ai", "free"],
    websiteUrl: "https://example.com",
    description: "A".repeat(60),
    logoUrl: "",
    images: [],
    plan: "BASIC" as const,
  };

  it("accepts a fully valid listing", () => {
    expect(listingSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a description shorter than 50 characters", () => {
    const result = listingSchema.safeParse({ ...valid, description: "too short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid website URL", () => {
    const result = listingSchema.safeParse({ ...valid, websiteUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 6 tags", () => {
    const result = listingSchema.safeParse({ ...valid, tags: ["a", "b", "c", "d", "e", "f", "g"] });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown plan", () => {
    const result = listingSchema.safeParse({ ...valid, plan: "ENTERPRISE" });
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("rejects a rating outside 1-5", () => {
    expect(reviewSchema.safeParse({ listingId: "l1", rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ listingId: "l1", rating: 6 }).success).toBe(false);
  });

  it("accepts a rating with no comment", () => {
    expect(reviewSchema.safeParse({ listingId: "l1", rating: 4 }).success).toBe(true);
  });
});

describe("searchParamsSchema", () => {
  it("coerces string page/rating params to numbers", () => {
    const result = searchParamsSchema.parse({ page: "2", rating: "4" });
    expect(result.page).toBe(2);
    expect(result.rating).toBe(4);
  });

  it("rejects an invalid sort value", () => {
    expect(searchParamsSchema.safeParse({ sort: "cheapest" }).success).toBe(false);
  });
});
