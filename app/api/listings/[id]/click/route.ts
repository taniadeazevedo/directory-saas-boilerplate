import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { success } = rateLimit(`click:${getClientIp(req)}:${id}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await auth();

  await prisma.$transaction([
    prisma.clickEvent.create({
      data: {
        listingId: id,
        userId: session?.user?.id,
        referrer: req.headers.get("referer") ?? undefined,
      },
    }),
    prisma.listing.update({
      where: { id },
      data: { clicksCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
