import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserActiveSubscription, getUserFavorites, getUserListings } from "@/lib/data";
import { getCustomerPortalUrl } from "@/lib/lemonsqueezy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListingActions } from "@/components/dashboard/listing-actions";
import { Reveal } from "@/components/motion/reveal";
import { Plus, Eye, MousePointerClick, Heart, CreditCard } from "lucide-react";
import { translateCategory } from "@/lib/category-i18n";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  ARCHIVED: "outline",
};

export default async function DashboardPage() {
  const session = await auth();
  const [listings, favorites, t, tCategories, subscription] = await Promise.all([
    getUserListings(session!.user.id),
    getUserFavorites(session!.user.id),
    getTranslations("dashboard"),
    getTranslations("categories"),
    getUserActiveSubscription(session!.user.id),
  ]);

  const portalUrl = subscription ? await getCustomerPortalUrl(subscription.lemonSqueezyId) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Reveal className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <div className="flex gap-2">
          {portalUrl && (
            <Button asChild variant="outline">
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                <CreditCard className="mr-1 h-4 w-4" /> {t("manageBilling")}
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href="/listing/new">
              <Plus className="mr-1 h-4 w-4" /> {t("newListing")}
            </Link>
          </Button>
        </div>
      </Reveal>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">{t("myListings")}</TabsTrigger>
          <TabsTrigger value="favorites">{t("favorites")}</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noListings")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.listing")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead className="max-sm:hidden">{t("table.plan")}</TableHead>
                    <TableHead className="max-sm:hidden">{t("table.views")}</TableHead>
                    <TableHead className="max-md:hidden">{t("table.clicks")}</TableHead>
                    <TableHead className="max-md:hidden">{t("table.favorites")}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="max-w-[160px] whitespace-normal sm:max-w-none sm:whitespace-nowrap">
                        <Link href={`/listing/${listing.id}/analytics`} className="font-medium hover:underline">
                          {listing.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{translateCategory(tCategories, listing.category)}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[listing.status]} className="rounded-full">
                          {t(`status.${listing.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-sm:hidden text-sm">{listing.plan}</TableCell>
                      <TableCell className="max-sm:hidden">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" /> {listing.viewsCount}
                        </span>
                      </TableCell>
                      <TableCell className="max-md:hidden">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MousePointerClick className="h-3.5 w-3.5" /> {listing.clicksCount}
                        </span>
                      </TableCell>
                      <TableCell className="max-md:hidden">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-3.5 w-3.5" /> {listing._count.favorites}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ListingActions listingId={listing.id} status={listing.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noFavorites")}</p>
          ) : (
            <div className="space-y-4">
              <Link href="/dashboard/bookmarks" className="text-sm text-primary hover:underline">
                {t("viewBookmarks")}
              </Link>
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/directory/${fav.listing.slug}`}
                    className="card-hover rounded-xl border p-4"
                  >
                    <p className="font-medium">{fav.listing.title}</p>
                    <p className="text-sm text-muted-foreground">{translateCategory(tCategories, fav.listing.category)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
