import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, type LemonSqueezyWebhookEvent } from "@/lib/lemonsqueezy";
import { env } from "@/lib/env";
import type { ListingPlan, SubscriptionStatus } from "@prisma/client";

// Lemon Squeezy -> our SubscriptionStatus enum
const STATUS_MAP: Record<string, SubscriptionStatus> = {
  on_trial: "ON_TRIAL",
  active: "ACTIVE",
  paused: "PAUSED",
  past_due: "PAST_DUE",
  unpaid: "UNPAID",
  cancelled: "CANCELLED",
  expired: "EXPIRED",
};

// Map Lemon Squeezy variant IDs (set in your store) to internal plans.
const VARIANT_PLAN_MAP: Record<string, ListingPlan> = {
  [env.LEMONSQUEEZY_VARIANT_FEATURED ?? "featured-variant-id"]: "FEATURED",
  [env.LEMONSQUEEZY_VARIANT_SPONSOR ?? "sponsor-variant-id"]: "SPONSOR",
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  let valid = false;
  try {
    valid = verifyWebhookSignature(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name as LemonSqueezyWebhookEvent;
  const customData = payload.meta?.custom_data ?? {};
  const attrs = payload.data?.attributes ?? {};
  const lemonSqueezyId = String(payload.data?.id ?? "");

  const userId: string | undefined = customData.user_id;
  const listingId: string | undefined = customData.listing_id || undefined;

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_paused":
      case "subscription_unpaused":
      case "subscription_expired":
      case "subscription_cancelled": {
        if (!userId) break;

        const variantId = String(attrs.variant_id ?? "");
        const plan = VARIANT_PLAN_MAP[variantId] ?? "FEATURED";
        const status = STATUS_MAP[attrs.status as string] ?? "ACTIVE";

        await prisma.subscription.upsert({
          where: { lemonSqueezyId },
          create: {
            lemonSqueezyId,
            userId,
            variantId,
            customerId: String(attrs.customer_id ?? ""),
            plan,
            status,
            renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
            endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
          },
          update: {
            status,
            renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
            endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
          },
        });

        if (listingId) {
          const isActive = status === "ACTIVE" || status === "ON_TRIAL";
          await prisma.listing.update({
            where: { id: listingId },
            data: {
              plan: isActive ? plan : "BASIC",
              isFeatured: isActive,
              expiresAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
            },
          });
        }
        break;
      }

      case "order_created": {
        if (!userId) break;
        await prisma.order.create({
          data: {
            lemonSqueezyId,
            userId,
            variantId: String(attrs.first_order_item?.variant_id ?? ""),
            total: Number(attrs.total ?? 0),
            status: String(attrs.status ?? "paid"),
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[lemonsqueezy webhook] failed to process event", eventName, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
