"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { toggleFeatured } from "@/lib/actions";
import { toast } from "sonner";

export function FeaturedToggle({ listingId, isFeatured }: { listingId: string; isFeatured: boolean }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange() {
    startTransition(async () => {
      await toggleFeatured(listingId);
      toast.success(t("featuredUpdated"));
      router.refresh();
    });
  }

  return <Switch checked={isFeatured} onCheckedChange={handleChange} disabled={isPending} aria-label={t("featuredCol")} />;
}
