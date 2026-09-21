"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/lib/actions";
import { useIsLocalBookmarked } from "@/lib/hooks/use-local-bookmarks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  isAuthenticated,
  initialFavorited = false,
}: {
  listingId: string;
  isAuthenticated: boolean;
  initialFavorited?: boolean;
}) {
  const t = useTranslations("favorite");
  const [dbFavorited, setDbFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const local = useIsLocalBookmarked(listingId);

  const favorited = isAuthenticated ? dbFavorited : local.favorited;

  function handleClick() {
    if (!isAuthenticated) {
      local.toggle();
      return;
    }
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setDbFavorited(!!result.favorited);
    });
  }

  return (
    <Button variant="outline" size="lg" onClick={handleClick} disabled={isPending}>
      <Heart className={cn("mr-2 h-4 w-4", favorited && "fill-red-500 text-red-500")} />
      {favorited ? t("saved") : t("save")}
    </Button>
  );
}
