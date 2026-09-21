import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { getAdminStats, getPendingListings } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { translateCategory } from "@/lib/category-i18n";

export default async function AdminPage() {
  const [stats, pending, t, tCategories] = await Promise.all([
    getAdminStats(),
    getPendingListings(),
    getTranslations("admin"),
    getTranslations("categories"),
  ]);

  const cards = [
    { label: t("stats.totalUsers"), value: stats.totalUsers },
    { label: t("stats.publishedListings"), value: stats.totalListings },
    { label: t("stats.pendingReview"), value: stats.pendingListings },
    { label: t("stats.pendingReviews"), value: stats.pendingReviews },
    { label: t("stats.pendingClaims"), value: stats.pendingClaims },
    { label: t("stats.activeSubscriptions"), value: stats.activeSubscriptions },
    { label: t("stats.estimatedMrr"), value: formatCurrency(stats.mrr) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/listings">{t("nav.listings")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/reviews">{t("nav.reviews")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/claims">{t("nav.claims")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">{t("nav.users")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/payments">{t("nav.payments")}</Link>
          </Button>
        </div>
      </div>

      <StaggerGroup className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.04}>
        {cards.map((card) => (
          <StaggerItem key={card.label}>
            <Card className="card-hover h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-normal text-muted-foreground">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <h2 className="mb-4 text-lg font-semibold tracking-tight">{t("pendingModeration")}</h2>
      <div className="space-y-3">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">{t("noPendingListings")}</p>}
        {pending.map((listing) => (
          <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <p className="font-medium">{listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {translateCategory(tCategories, listing.category)} · {listing.user.name} ({listing.user.email})
              </p>
            </div>
            <ModerationActions listingId={listing.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
