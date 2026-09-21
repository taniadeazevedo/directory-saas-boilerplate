import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import type { Prisma } from "@prisma/client";

export type ListingFilters = {
  q?: string;
  category?: string; // category slug
  price?: "free" | "paid";
  rating?: number;
  badge?: "verified" | "featured";
  sort?: "newest" | "popular" | "rating";
  page?: number;
};

const PAGE_SIZE = 12;

export async function getListings(filters: ListingFilters) {
  const where: Prisma.ListingWhereInput = {
    status: "APPROVED",
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { tags: { has: filters.q.toLowerCase() } },
    ];
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.price === "free") {
    where.plan = "BASIC";
  } else if (filters.price === "paid") {
    where.plan = { in: ["FEATURED", "SPONSOR"] };
  }

  if (filters.badge === "featured") {
    where.isFeatured = true;
  }
  if (filters.badge === "verified") {
    where.claimedAt = { not: null };
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    filters.sort === "popular"
      ? [{ isFeatured: "desc" }, { clicksCount: "desc" }]
      : filters.sort === "rating"
        ? [{ isFeatured: "desc" }, { reviews: { _count: "desc" } }]
        : [{ isFeatured: "desc" }, { createdAt: "desc" }];

  const page = filters.page ?? 1;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  let withRatings = listings.map((listing) => ({
    ...listing,
    avgRating:
      listing.reviews.length > 0
        ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
        : 0,
  }));

  if (filters.rating) {
    withRatings = withRatings.filter((l) => l.avgRating >= filters.rating!);
  }

  return {
    listings: withRatings,
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page,
  };
}

export async function getPublicStats() {
  const [listings, categories, reviews, clicks] = await Promise.all([
    prisma.listing.count({ where: { status: "APPROVED" } }),
    prisma.category.count(),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.listing.aggregate({ _sum: { clicksCount: true } }),
  ]);

  return {
    listings,
    categories,
    reviews,
    clicks: clicks._sum.clicksCount ?? 0,
  };
}

export async function getFeaturedListings(limit = 6) {
  return prisma.listing.findMany({
    where: { status: "APPROVED", isFeatured: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    include: { category: true },
  });
}

export async function getListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      category: true,
      user: { select: { id: true, name: true, image: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: { where: { status: "APPROVED" } } } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getUserActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "ON_TRIAL", "PAST_DUE"] } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getUserListings(userId: string) {
  return prisma.listing.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { category: true, _count: { select: { favorites: true } } },
  });
}

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: { listing: { include: { category: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

/** Set of listing ids the given user has bookmarked — cheap to spread across a listing grid. */
export async function getUserFavoriteIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await prisma.favorite.findMany({ where: { userId }, select: { listingId: true } });
  return new Set(rows.map((r) => r.listingId));
}

const ANALYTICS_DAYS = 14;

export async function getListingAnalytics(listingId: string) {
  const locale = await getLocale();
  const since = new Date();
  since.setDate(since.getDate() - (ANALYTICS_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [rows, totalClicks, favoritesCount] = await Promise.all([
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") as day, count(*) as count
      FROM "click_events"
      WHERE "listingId" = ${listingId} AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.clickEvent.count({ where: { listingId } }),
    prisma.favorite.count({ where: { listingId } }),
  ]);

  const byDay = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));

  const series = Array.from({ length: ANALYTICS_DAYS }).map((_, i) => {
    const date = new Date(since);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    return {
      date: date.toLocaleDateString(locale, { day: "2-digit", month: "short" }),
      clicks: byDay.get(key) ?? 0,
    };
  });

  return { series, totalClicks, favoritesCount };
}

// ---- Admin ----

export async function getPendingReviews() {
  return prisma.review.findMany({
    where: { isApproved: false },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      user: { select: { name: true, email: true } },
      listing: { select: { title: true, slug: true } },
    },
  });
}

export async function getPendingClaims() {
  return prisma.claimRequest.findMany({
    where: { status: "PENDING" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      user: { select: { name: true, email: true } },
      listing: { select: { title: true, slug: true, claimedAt: true } },
    },
  });
}

export async function getClaimForUser(listingId: string, userId: string) {
  return prisma.claimRequest.findUnique({
    where: { listingId_userId: { listingId, userId } },
  });
}

export async function getPendingListings() {
  return prisma.listing.findMany({
    where: { status: "PENDING" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: { category: true, user: { select: { name: true, email: true } } },
  });
}

export async function getAdminStats() {
  const [totalUsers, totalListings, pendingListings, pendingReviews, pendingClaims, activeSubscriptions] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: "APPROVED" } }),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.claimRequest.count({ where: { status: "PENDING" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    ]);

  const mrrResult = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { plan: true },
  });
  const PRICE: Record<string, number> = { FEATURED: 29, SPONSOR: 99, BASIC: 0 };
  const mrr = mrrResult.reduce((sum, s) => sum + (PRICE[s.plan] ?? 0), 0);

  return { totalUsers, totalListings, pendingListings, pendingReviews, pendingClaims, activeSubscriptions, mrr };
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { _count: { select: { listings: true } } },
  });
}
