import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

// Vercel Cron (see vercel.json) hits this daily to downgrade listings whose
// paid plan lapsed (no active subscription renewal came through the webhook).
export async function GET(req: NextRequest) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.listing.updateMany({
    where: {
      plan: { in: ["FEATURED", "SPONSOR"] },
      expiresAt: { lt: new Date() },
    },
    data: { plan: "BASIC", isFeatured: false },
  });

  return NextResponse.json({ downgraded: result.count });
}
