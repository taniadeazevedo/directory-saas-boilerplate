import { Resend } from "resend";
import { ListingApprovedEmail } from "@/components/emails/listing-approved";
import { ListingRejectedEmail } from "@/components/emails/listing-rejected";
import { WelcomeEmail } from "@/components/emails/welcome";
import { env } from "@/lib/env";

// A placeholder key keeps the client constructible when RESEND_API_KEY isn't
// set yet (e.g. local dev, CI builds) — calls will fail at send time instead
// of crashing the whole app at import time.
export const resend = new Resend(env.RESEND_API_KEY || "re_placeholder_key");

const FROM = env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Bienvenido/a al directorio",
    react: WelcomeEmail({ name }),
  });
}

export async function sendListingApprovedEmail(to: string, listingTitle: string, listingUrl: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Tu listado "${listingTitle}" fue aprobado`,
    react: ListingApprovedEmail({ listingTitle, listingUrl }),
  });
}

export async function sendListingRejectedEmail(to: string, listingTitle: string, reason?: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Tu listado "${listingTitle}" no fue aprobado`,
    react: ListingRejectedEmail({ listingTitle, reason }),
  });
}
