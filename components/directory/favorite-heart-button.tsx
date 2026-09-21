"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions";
import { useIsLocalBookmarked } from "@/lib/hooks/use-local-bookmarks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Compact heart toggle for a listing card. Signed-in users persist to the
 * database (`Favorite` model); signed-out visitors persist to localStorage
 * via `useIsLocalBookmarked` — no login required to start saving listings.
 */
export function FavoriteHeartButton({
  listingId,
  isAuthenticated,
  initialFavorited = false,
  className,
}: {
  listingId: string;
  isAuthenticated: boolean;
  initialFavorited?: boolean;
  className?: string;
}) {
  const [dbFavorited, setDbFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const local = useIsLocalBookmarked(listingId);

  const favorited = isAuthenticated ? dbFavorited : local.favorited;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from saved" : "Save listing"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur transition-colors hover:bg-background",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4 text-muted-foreground", favorited && "fill-red-500 text-red-500")} />
    </button>
  );
}
