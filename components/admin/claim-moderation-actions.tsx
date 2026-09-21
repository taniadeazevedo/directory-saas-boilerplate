"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { approveClaim, rejectClaim } from "@/lib/actions";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function ClaimModerationActions({ claimId }: { claimId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveClaim(claimId);
      toast.success(t("claimApproved"));
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectClaim(claimId);
      toast.success(t("claimRejected"));
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        <Check className="mr-1 h-4 w-4" /> {t("approve")}
      </Button>
      <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
        <X className="mr-1 h-4 w-4" /> {t("reject")}
      </Button>
    </div>
  );
}
