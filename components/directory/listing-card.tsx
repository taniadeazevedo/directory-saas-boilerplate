import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/directory/rating-stars";
import { FavoriteHeartButton } from "@/components/directory/favorite-heart-button";
import { truncate } from "@/lib/format";
import { translateCategory } from "@/lib/category-i18n";
import { BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  logoUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  claimedAt: Date | null;
  plan: string;
  avgRating?: number;
  category: { name: string; slug: string };
};

export async function ListingCard({
  listing,
  view = "grid",
  isAuthenticated = false,
  isFavorited = false,
}: {
  listing: ListingCardData;
  view?: "grid" | "list";
  isAuthenticated?: boolean;
  isFavorited?: boolean;
}) {
  const [t, tCategories] = await Promise.all([getTranslations("filters"), getTranslations("categories")]);

  return (
    <div className={cn("relative", listing.isFeatured && "rounded-2xl ring-1 ring-primary/20")}>
      <Link
        href={`/directory/${listing.slug}`}
        className={cn(
          "card-hover group relative block overflow-hidden rounded-2xl border bg-card p-4",
          listing.isFeatured && "border-primary/25",
          view === "list" && "flex items-center gap-4",
        )}
      >
        {listing.isFeatured && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] to-accent/[0.04]" />
        )}

        <div className={cn("relative flex items-start gap-3", view === "list" && "flex-1")}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {listing.logoUrl ? (
              <Image src={listing.logoUrl} alt={listing.title} width={48} height={48} className="object-cover" />
            ) : (
              <span className="text-lg font-semibold text-muted-foreground">
                {listing.title[0]}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 pr-8">
              <h3 className="truncate font-medium group-hover:text-primary">{listing.title}</h3>
              {listing.claimedAt && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {truncate(listing.description, view === "list" ? 140 : 90)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {listing.isFeatured && (
                <Badge className="rounded-full gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> {t("featured")}
                </Badge>
              )}
              <Badge variant="secondary" className="rounded-full">
                {translateCategory(tCategories, listing.category)}
              </Badge>
              {listing.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  {tag}
                </Badge>
              ))}
              {listing.avgRating !== undefined && listing.avgRating > 0 && (
                <RatingStars rating={listing.avgRating} />
              )}
            </div>
          </div>
        </div>
      </Link>

      <FavoriteHeartButton
        listingId={listing.id}
        isAuthenticated={isAuthenticated}
        initialFavorited={isFavorited}
        className="absolute right-3 top-3"
      />
    </div>
  );
}
