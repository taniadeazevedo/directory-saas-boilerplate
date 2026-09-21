import { getTranslations } from "next-intl/server";
import { ListingCard, type ListingCardData } from "@/components/directory/listing-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export async function ListingGrid({
  listings,
  view = "grid",
  isAuthenticated = false,
  favoritedIds,
}: {
  listings: ListingCardData[];
  view?: "grid" | "list";
  isAuthenticated?: boolean;
  favoritedIds?: Set<string>;
}) {
  if (listings.length === 0) {
    const t = await getTranslations("listingGrid");
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
        {t("noResults")}
      </div>
    );
  }

  return (
    <StaggerGroup
      className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3")}
    >
      {listings.map((listing) => (
        <StaggerItem key={listing.slug}>
          <ListingCard
            listing={listing}
            view={view}
            isAuthenticated={isAuthenticated}
            isFavorited={favoritedIds?.has(listing.id) ?? false}
          />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
