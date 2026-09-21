"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { requestClaim } from "@/lib/actions";
import { toast } from "sonner";
import { BadgeCheck, Clock } from "lucide-react";

type ClaimState = "none" | "pending" | "claimed";

export function ClaimListingDialog({
  listingId,
  listingTitle,
  state,
}: {
  listingId: string;
  listingTitle: string;
  state: ClaimState;
}) {
  const t = useTranslations("claim");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (state === "claimed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <BadgeCheck className="h-4 w-4 text-primary" /> {t("verified")}
      </span>
    );
  }

  if (state === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" /> {t("pending")}
      </span>
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await requestClaim(listingId, message || undefined);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("success"));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { title: listingTitle })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="claim-message">{t("messageLabel")}</Label>
          <Textarea
            id="claim-message"
            placeholder={t("messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? t("sending") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
