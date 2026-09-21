import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserFavorites } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { translateCategory } from "@/lib/category-i18n";
import { ArrowLeft } from "lucide-react";

export default async function BookmarksPage() {
  const session = await auth();
  const [favorites, t, tCategories] = await Promise.all([
    getUserFavorites(session!.user.id),
    getTranslations("bookmarksPage"),
    getTranslations("categories"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("backToDashboard")}
      </Link>

      <Reveal className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </Reveal>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{t("empty")}</p>
          <Button asChild variant="outline">
            <Link href="/directory">{t("browseCta")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <Link key={fav.id} href={`/directory/${fav.listing.slug}`} className="card-hover rounded-xl border p-4">
              <p className="font-medium">{fav.listing.title}</p>
              <p className="text-sm text-muted-foreground">{translateCategory(tCategories, fav.listing.category)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
