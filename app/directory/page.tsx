import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/directory/search-bar";
import { Filters } from "@/components/directory/filters";
import { ListingGrid } from "@/components/directory/listing-grid";
import { Pagination } from "@/components/directory/pagination";
import { getCategories, getListings, getUserFavoriteIds } from "@/lib/data";
import { auth } from "@/auth";
import { searchParamsSchema } from "@/lib/validations";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("directoryPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = searchParamsSchema.parse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    price: typeof raw.price === "string" ? raw.price : undefined,
    rating: typeof raw.rating === "string" ? raw.rating : undefined,
    badge: typeof raw.badge === "string" ? raw.badge : undefined,
    view: typeof raw.view === "string" ? raw.view : undefined,
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });

  const session = await auth();
  const [{ listings, total, pageCount, page }, categories, t, favoritedIds] = await Promise.all([
    getListings(filters),
    getCategories(),
    getTranslations("directoryPage"),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-xl">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <Suspense>
          <Filters categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.listings }))} />
        </Suspense>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">{t("results", { count: total })}</p>
          <ListingGrid
            listings={listings}
            view={filters.view}
            isAuthenticated={!!session?.user}
            favoritedIds={favoritedIds}
          />
          <Suspense>
            <Pagination page={page} pageCount={pageCount} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
