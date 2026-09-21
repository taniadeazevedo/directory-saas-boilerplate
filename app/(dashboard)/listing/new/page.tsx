import { getTranslations } from "next-intl/server";
import { ListingForm } from "@/components/forms/listing-form";
import { getCategories } from "@/lib/data";
import { translateCategory } from "@/lib/category-i18n";

export default async function NewListingPage() {
  const [categories, t, tCategories] = await Promise.all([
    getCategories(),
    getTranslations("listingPages"),
    getTranslations("categories"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">{t("newTitle")}</h1>
      <ListingForm categories={categories.map((c) => ({ id: c.id, name: translateCategory(tCategories, c) }))} />
    </div>
  );
}
