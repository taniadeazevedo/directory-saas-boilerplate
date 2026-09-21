"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { approveReview, rejectReview } from "@/lib/actions";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function ReviewModerationActions({ reviewId }: { reviewId: string }) {
  const t = useTranslations("admin");
  const tActions = useTranslations("listingActions");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveReview(reviewId);
      toast.success(t("reviewPublished"));
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectReview(reviewId);
      toast.success(t("reviewDeleted"));
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        <Check className="mr-1 h-4 w-4" /> {t("approve")}
      </Button>
      <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
        <X className="mr-1 h-4 w-4" /> {tActions("delete")}
      </Button>
    </div>
  );
}
