import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const APP_URL = env.NEXT_PUBLIC_APP_URL;

// Generated per-request (not at build time) so newly approved listings show
// up immediately instead of only after the next deploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: APP_URL, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/directory`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${APP_URL}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...listings.map((l) => ({
      url: `${APP_URL}/directory/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
