"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { approveListing, rejectListing } from "@/lib/actions";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function ModerationActions({ listingId }: { listingId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  function handleApprove() {
    startTransition(async () => {
      await approveListing(listingId);
      toast.success(t("listingApproved"));
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectListing(listingId, reason || undefined);
      toast.success(t("listingRejected"));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        <Check className="mr-1 h-4 w-4" /> {t("approve")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={isPending}>
            <X className="mr-1 h-4 w-4" /> {t("reject")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectReasonTitle")}</DialogTitle>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("rejectReasonPlaceholder")} />
          <DialogFooter>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {t("confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
