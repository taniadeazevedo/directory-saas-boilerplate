import crypto from "node:crypto";
import { env } from "@/lib/env";

const API_BASE = "https://api.lemonsqueezy.com/v1";

function headers() {
  if (!env.LEMONSQUEEZY_API_KEY) {
    throw new Error(
      "LEMONSQUEEZY_API_KEY is not set — add it to .env.local to enable paid listing plans.",
    );
  }
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
  };
}

/** Creates a Lemon Squeezy checkout URL for a given variant, pre-filled with the buyer's data. */
export async function createCheckout(params: {
  variantId: string;
  userId: string;
  email: string;
  listingId?: string;
  redirectUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: params.email,
            custom: {
              user_id: params.userId,
              listing_id: params.listingId ?? "",
            },
          },
          product_options: {
            redirect_url: params.redirectUrl ?? `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: env.LEMONSQUEEZY_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: params.variantId },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Lemon Squeezy checkout failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}

/**
 * The self-service "Customer Portal" URL for a subscription — buyers use it
 * to download invoices, update their card, or cancel without contacting
 * support. Returns null if Lemon Squeezy isn't configured or the request
 * fails, so callers can hide the link rather than show a broken one.
 */
export async function getCustomerPortalUrl(subscriptionId: string): Promise<string | null> {
  if (!env.LEMONSQUEEZY_API_KEY) return null;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    return json.data?.attributes?.urls?.customer_portal ?? null;
  } catch {
    return null;
  }
}

/** Cancels a subscription in Lemon Squeezy (used by the admin panel). */
export async function cancelSubscription(lemonSqueezyId: string) {
  const res = await fetch(`${API_BASE}/subscriptions/${lemonSqueezyId}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`Lemon Squeezy cancel failed: ${res.status} ${await res.text()}`);
  }
}

/** Verifies the `X-Signature` header on an incoming webhook using the shared secret (HMAC SHA-256). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export type LemonSqueezyWebhookEvent =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_unpaused"
  | "order_created";
