import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { success } = rateLimit(`search:${getClientIp(req)}`, 30, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Demasiadas búsquedas, inténtalo en un momento." }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    select: { title: true, slug: true, logoUrl: true },
    take: 6,
  });

  return NextResponse.json({ results });
}
