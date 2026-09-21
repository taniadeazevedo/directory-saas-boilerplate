import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/data";
import { translateCategory } from "@/lib/category-i18n";
import { ListingForm } from "@/components/forms/listing-form";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const [listing, categories, t, tCategories] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    getCategories(),
    getTranslations("listingPages"),
    getTranslations("categories"),
  ]);

  if (!listing) notFound();
  if (listing.userId !== session?.user.id && session?.user.role !== "ADMIN") notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">{t("editTitle")}</h1>
      <ListingForm
        categories={categories.map((c) => ({ id: c.id, name: translateCategory(tCategories, c) }))}
        listingId={listing.id}
        defaultValues={{
          title: listing.title,
          categoryId: listing.categoryId,
          tags: listing.tags,
          websiteUrl: listing.websiteUrl,
          description: listing.description,
          logoUrl: listing.logoUrl ?? "",
          images: listing.images,
          plan: listing.plan,
        }}
      />
    </div>
  );
}
