import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Filters } from "@/components/directory/filters";
import { ListingGrid } from "@/components/directory/listing-grid";
import { Pagination } from "@/components/directory/pagination";
import { getCategories, getCategoryBySlug, getListings, getUserFavoriteIds } from "@/lib/data";
import { auth } from "@/auth";
import { searchParamsSchema } from "@/lib/validations";
import { translateCategory } from "@/lib/category-i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  const [t, tCategories] = await Promise.all([
    getTranslations("categoryPage"),
    getTranslations("categories"),
  ]);
  const categoryName = translateCategory(tCategories, category);
  return {
    title: categoryName,
    description: category.description ?? t("metaDescriptionFallback", { category: categoryName }),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const raw = await searchParams;
  const filters = searchParamsSchema.parse({
    ...raw,
    category: categorySlug,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });

  const session = await auth();
  const [{ listings, total, pageCount, page }, categories, t, tCategories, favoritedIds] = await Promise.all([
    getListings(filters),
    getCategories(),
    getTranslations("directoryPage"),
    getTranslations("categories"),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{translateCategory(tCategories, category)}</h1>
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
