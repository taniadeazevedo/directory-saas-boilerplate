import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ClaimModerationActions } from "@/components/admin/claim-moderation-actions";
import { getPendingClaims } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function AdminClaimsPage() {
  const [claims, t, locale] = await Promise.all([
    getPendingClaims(),
    getTranslations("admin"),
    getLocale(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">{t("pendingClaimsTitle")}</h1>

      <div className="space-y-3">
        {claims.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("noPendingClaims")}</p>
        )}
        {claims.map((claim) => (
          <div key={claim.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/directory/${claim.listing.slug}`} className="font-medium hover:underline">
                  {claim.listing.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {t("requestedBy", { name: claim.user.name ?? "", email: claim.user.email })} ·{" "}
                  {formatDate(claim.createdAt, locale)}
                </p>
                {claim.message && (
                  <p className="mt-2 rounded-lg bg-muted p-3 text-sm">{claim.message}</p>
                )}
              </div>
              <ClaimModerationActions claimId={claim.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
