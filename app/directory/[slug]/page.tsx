import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/directory/rating-stars";
import { ReviewForm } from "@/components/directory/review-form";
import { OutboundLink } from "@/components/directory/outbound-link";
import { FavoriteButton } from "@/components/directory/favorite-button";
import { GalleryLightbox } from "@/components/directory/gallery-lightbox";
import { ClaimListingDialog } from "@/components/directory/claim-listing-dialog";
import { Reveal } from "@/components/motion/reveal";
import { getClaimForUser, getListingBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate } from "@/lib/format";
import { buildListingJsonLd, safeJsonLd } from "@/lib/json-ld";
import { env } from "@/lib/env";
import { translateCategory } from "@/lib/category-i18n";
import { BadgeCheck } from "lucide-react";

const APP_URL = env.NEXT_PUBLIC_APP_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 155),
      images: [`/directory/${slug}/opengraph-image`],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  prisma.listing.update({ where: { id: listing.id }, data: { viewsCount: { increment: 1 } } }).catch(() => {});

  const session = await auth();
  let favorited = false;
  let claimState: "none" | "pending" | "claimed" = listing.claimedAt ? "claimed" : "none";
  if (session?.user) {
    const [fav, claim] = await Promise.all([
      prisma.favorite.findUnique({
        where: { listingId_userId: { listingId: listing.id, userId: session.user.id } },
      }),
      claimState === "none" ? getClaimForUser(listing.id, session.user.id) : null,
    ]);
    favorited = !!fav;
    if (claim?.status === "PENDING") claimState = "pending";
  }

  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : 0;

  const jsonLd = buildListingJsonLd(listing, APP_URL);
  const [t, tCategories, locale] = await Promise.all([
    getTranslations("listingDetail"),
    getTranslations("categories"),
    getLocale(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
            {listing.logoUrl ? (
              <Image src={listing.logoUrl} alt={listing.title} width={64} height={64} className="object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">{listing.title[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
              {listing.claimedAt && <BadgeCheck className="h-5 w-5 text-primary" />}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <RatingStars rating={avgRating} />
              <span>{t("reviewsCount", { count: listing.reviews.length })}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="rounded-full">
                {translateCategory(tCategories, listing.category)}
              </Badge>
              {listing.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <OutboundLink listingId={listing.id} websiteUrl={listing.websiteUrl} />
          <FavoriteButton listingId={listing.id} isAuthenticated={!!session?.user} initialFavorited={favorited} />
        </div>
      </Reveal>

      {listing.images.length > 0 && (
        <Reveal delay={0.1} className="mt-8">
          <GalleryLightbox images={listing.images} alt={listing.title} />
        </Reveal>
      )}

      <Reveal delay={0.15} className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <p className="whitespace-pre-line">{listing.description}</p>
      </Reveal>

      {session?.user && (
        <div className="mt-6">
          <ClaimListingDialog listingId={listing.id} listingTitle={listing.title} state={claimState} />
        </div>
      )}

      <div className="mt-10 border-t pt-8">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">{t("reviewsHeading")}</h2>
        {session?.user ? (
          <div className="mb-6">
            <ReviewForm listingId={listing.id} />
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">{t("loginToReview")}</p>
        )}

        <div className="space-y-4">
          {listing.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{review.user.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt, locale)}</span>
              </div>
              <RatingStars rating={review.rating} />
              {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
          {listing.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
