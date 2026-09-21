import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { StatsRow } from "@/components/home/stats-row";
import { FeatureBento } from "@/components/home/feature-bento";
import { ListingGrid } from "@/components/directory/listing-grid";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getCategories, getFeaturedListings, getPublicStats, getUserFavoriteIds } from "@/lib/data";
import { auth } from "@/auth";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const [featured, categories, stats, t, favoritedIds] = await Promise.all([
    getFeaturedListings(6),
    getCategories(),
    getPublicStats(),
    getTranslations("home"),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <div>
      <Hero categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <StatsRow stats={stats} />
      <FeatureBento />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{t("featured")}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/directory">
              {t("viewAll")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
        <ListingGrid listings={featured} isAuthenticated={!!session?.user} favoritedIds={favoritedIds} />
      </section>

      <section className="relative overflow-hidden border-t">
        <div className="mesh-glow absolute inset-0 -z-10 opacity-60" />
        <Reveal className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("ctaHeading")}</h2>
          <p className="mt-2 text-muted-foreground">{t("ctaSubheading")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/listing/new">{t("ctaPublish")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">{t("ctaPricing")}</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
