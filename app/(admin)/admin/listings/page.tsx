import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { FeaturedToggle } from "@/components/admin/featured-toggle";
import { translateCategory } from "@/lib/category-i18n";
import { Download } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  ARCHIVED: "outline",
};

export default async function AdminListingsPage() {
  const [listings, t, tCategories] = await Promise.all([
    prisma.listing.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { category: true, user: { select: { name: true, email: true } } },
    }),
    getTranslations("admin"),
    getTranslations("categories"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("allListings")}</h1>
        <Button asChild variant="outline" size="sm">
          <a href="/api/admin/export/listings">
            <Download className="mr-1.5 h-4 w-4" /> {t("exportCsv")}
          </a>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("nav.listings")}</TableHead>
            <TableHead className="max-md:hidden">{t("author")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="max-sm:hidden">{t("plan")}</TableHead>
            <TableHead>{t("featuredCol")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="max-w-[140px] whitespace-normal sm:max-w-none sm:whitespace-nowrap">
                <p className="font-medium">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{translateCategory(tCategories, listing.category)}</p>
              </TableCell>
              <TableCell className="max-md:hidden text-sm text-muted-foreground">
                {listing.user.name}
                <br />
                {listing.user.email}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[listing.status]}>{listing.status}</Badge>
              </TableCell>
              <TableCell className="max-sm:hidden text-sm">{listing.plan}</TableCell>
              <TableCell>
                <FeaturedToggle listingId={listing.id} isFeatured={listing.isFeatured} />
              </TableCell>
              <TableCell>{listing.status === "PENDING" && <ModerationActions listingId={listing.id} />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
