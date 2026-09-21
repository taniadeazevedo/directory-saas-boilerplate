"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ReviewForm({ listingId }: { listingId: string }) {
  const t = useTranslations("reviewForm");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === 0) {
      toast.error(t("selectRating"));
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ listingId, rating, comment });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t("success"));
        setComment("");
        setRating(0);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(i + 1)}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hovered || rating) > i ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea placeholder={t("placeholder")} value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </div>
  );
}
