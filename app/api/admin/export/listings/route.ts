import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = await prisma.listing.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      category: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const rows = listings.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    category: l.category.name,
    status: l.status,
    plan: l.plan,
    isFeatured: l.isFeatured,
    ownerName: l.user.name ?? "",
    ownerEmail: l.user.email,
    websiteUrl: l.websiteUrl,
    views: l.viewsCount,
    clicks: l.clicksCount,
    createdAt: l.createdAt.toISOString(),
  }));

  const csv = toCsv(rows, [
    "id",
    "title",
    "slug",
    "category",
    "status",
    "plan",
    "isFeatured",
    "ownerName",
    "ownerEmail",
    "websiteUrl",
    "views",
    "clicks",
    "createdAt",
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="listings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
