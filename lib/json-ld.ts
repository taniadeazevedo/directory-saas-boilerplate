/**
 * Serializes a JSON-LD object for embedding in a <script type="application/ld+json">
 * tag. Escapes `<` so a value containing "</script>" can't break out of the
 * tag (the JSON-LD spec allows this escaping; browsers parse < as `<`).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type ListingForSchema = {
  title: string;
  description: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string;
  category: { name: string };
  reviews: { rating: number; comment: string | null; createdAt: Date; user: { name: string | null } }[];
};

export function buildListingJsonLd(listing: ListingForSchema, appUrl: string) {
  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: listing.title,
    description: listing.description,
    url: `${appUrl}/directory/${listing.slug}`,
    ...(listing.logoUrl ? { image: listing.logoUrl } : {}),
    applicationCategory: listing.category.name,
    ...(avgRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: listing.reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(listing.reviews.length > 0
      ? {
          review: listing.reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            author: { "@type": "Person", name: r.user.name ?? "Usuario" },
            datePublished: r.createdAt.toISOString(),
            ...(r.comment ? { reviewBody: r.comment } : {}),
          })),
        }
      : {}),
  };
}
