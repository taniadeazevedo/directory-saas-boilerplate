import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { RatingStars } from "@/components/directory/rating-stars";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import { getPendingReviews } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function AdminReviewsPage() {
  const [reviews, t, locale] = await Promise.all([
    getPendingReviews(),
    getTranslations("admin"),
    getLocale(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">{t("pendingReviewsTitle")}</h1>

      <div className="space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("noPendingReviews")}</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/directory/${review.listing.slug}`} className="font-medium hover:underline">
                  {review.listing.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {review.user.name} ({review.user.email}) · {formatDate(review.createdAt, locale)}
                </p>
                <RatingStars rating={review.rating} />
                {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
              </div>
              <ReviewModerationActions reviewId={review.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
