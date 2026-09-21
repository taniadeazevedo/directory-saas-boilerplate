"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function OutboundLink({ listingId, websiteUrl }: { listingId: string; websiteUrl: string }) {
  const t = useTranslations("outbound");

  function handleClick() {
    fetch(`/api/listings/${listingId}/click`, { method: "POST" }).catch(() => {});
  }

  return (
    <Button asChild size="lg" onClick={handleClick}>
      <a href={websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
        {t("visitWebsite")} <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}
