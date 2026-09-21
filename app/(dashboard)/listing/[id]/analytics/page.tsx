import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getListingAnalytics } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClicksChart } from "@/components/dashboard/clicks-chart";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Eye, MousePointerClick, Heart, ArrowLeft } from "lucide-react";

export default async function ListingAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) notFound();
  if (listing.userId !== session?.user.id && session?.user.role !== "ADMIN") notFound();

  const [analytics, t] = await Promise.all([getListingAnalytics(id), getTranslations("listingPages")]);

  const cards = [
    { label: t("totalViews"), value: listing.viewsCount, icon: Eye },
    { label: t("websiteClicks"), value: analytics.totalClicks, icon: MousePointerClick },
    { label: t("favorites"), value: analytics.favoritesCount, icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> {t("backToDashboard")}
      </Link>

      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
        <p className="text-muted-foreground">{t("analyticsSubtitle")}</p>
      </Reveal>

      <StaggerGroup className="mt-6 grid gap-4 sm:grid-cols-3" stagger={0.05}>
        {cards.map((card) => (
          <StaggerItem key={card.label}>
            <Card className="card-hover h-full">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-normal text-muted-foreground">{card.label}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal delay={0.1}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t("clicksByDay")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClicksChart data={analytics.series} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
