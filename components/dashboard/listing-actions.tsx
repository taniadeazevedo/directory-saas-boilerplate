"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { pauseListing, republishListing, deleteListing } from "@/lib/actions";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

export function ListingActions({ listingId, status }: { listingId: string; status: string }) {
  const t = useTranslations("listingActions");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>, successMessage: string) {
    startTransition(async () => {
      try {
        await action(listingId);
        toast.success(successMessage);
        router.refresh();
      } catch {
        toast.error(t("genericError"));
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/listing/${listingId}/edit`}>{t("edit")}</Link>
        </DropdownMenuItem>
        {status !== "ARCHIVED" ? (
          <DropdownMenuItem onClick={() => run(pauseListing, t("paused"))}>{t("pause")}</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => run(republishListing, t("sentToReview"))}>
            {t("republish")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-destructive" onClick={() => run(deleteListing, t("deleted"))}>
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
