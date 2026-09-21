"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/auth";
import {
  listingSchema,
  registerSchema,
  reviewSchema,
  type ListingInput,
} from "@/lib/validations";
import { sendListingApprovedEmail, sendListingRejectedEmail, sendWelcomeEmail } from "@/lib/resend";
import { createCheckout } from "@/lib/lemonsqueezy";
import { slugifyBase } from "@/lib/format";
import { env } from "@/lib/env";

function slugify(title: string) {
  return `${slugifyBase(title)}-${nanoid(6)}`;
}

/**
 * A stale session (e.g. the JWT still references a user id that no longer
 * exists in the database, such as after a reseed) fails with a Prisma
 * foreign-key error. Surface that as a friendly, actionable message instead
 * of an unhandled 500.
 */
function friendlyErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "P2003" || error.code === "P2025")
  ) {
    return "Your session is no longer valid. Sign out and sign back in.";
  }
  console.error("[action] unexpected error", error);
  return "Something went wrong. Please try again.";
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });

    await sendWelcomeEmail(user.email, user.name ?? "").catch((e) =>
      console.error("[registerUser] welcome email failed", e),
    );

    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    return { error: friendlyErrorMessage(error) };
  }
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export async function createListing(input: ListingInput) {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in" };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  try {
    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        slug: slugify(data.title),
        description: data.description,
        websiteUrl: data.websiteUrl,
        logoUrl: data.logoUrl || null,
        images: data.images,
        categoryId: data.categoryId,
        tags: data.tags,
        plan: data.plan,
        status: "PENDING",
        userId: session.user.id,
      },
    });

    if (data.plan !== "BASIC") {
      const variantId =
        data.plan === "FEATURED" ? env.LEMONSQUEEZY_VARIANT_FEATURED : env.LEMONSQUEEZY_VARIANT_SPONSOR;

      if (!variantId) {
        return {
          error:
            "Paid plans aren't configured yet (missing LEMONSQUEEZY_VARIANT_FEATURED/SPONSOR in .env.local).",
        };
      }

      const checkoutUrl = await createCheckout({
        variantId,
        userId: session.user.id,
        email: session.user.email!,
        listingId: listing.id,
        redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      });

      return { success: true, listingId: listing.id, checkoutUrl };
    }

    revalidatePath("/dashboard");
    return { success: true, listingId: listing.id };
  } catch (error) {
    return { error: friendlyErrorMessage(error) };
  }
}

export async function updateListingStatus(listingId: string, ownerCheck = true) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (ownerCheck && listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return listing;
}

export async function updateListing(listingId: string, input: unknown) {
  const listing = await updateListingStatus(listingId);

  const parsed = listingSchema
    .omit({ plan: true })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      websiteUrl: parsed.data.websiteUrl,
      logoUrl: parsed.data.logoUrl || null,
      images: parsed.data.images,
      categoryId: parsed.data.categoryId,
      tags: parsed.data.tags,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function pauseListing(listingId: string) {
  await updateListingStatus(listingId);
  await prisma.listing.update({ where: { id: listingId }, data: { status: "ARCHIVED" } });
  revalidatePath("/dashboard");
}

export async function republishListing(listingId: string) {
  await updateListingStatus(listingId);
  await prisma.listing.update({ where: { id: listingId }, data: { status: "PENDING" } });
  revalidatePath("/dashboard");
}

export async function deleteListing(listingId: string) {
  await updateListingStatus(listingId);
  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/dashboard");
}

export async function requestClaim(listingId: string, message?: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in" };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found" };
  if (listing.claimedAt) return { error: "This listing has already been claimed" };
  if (listing.userId === session.user.id) return { error: "You're already the owner of this listing" };

  try {
    await prisma.claimRequest.upsert({
      where: { listingId_userId: { listingId, userId: session.user.id } },
      create: { listingId, userId: session.user.id, message },
      update: { message, status: "PENDING", reviewedAt: null },
    });
    revalidatePath(`/directory`);
    revalidatePath("/admin/claims");
    return { success: true };
  } catch (error) {
    return { error: friendlyErrorMessage(error) };
  }
}

export async function approveClaim(claimId: string) {
  await assertAdmin();

  const claim = await prisma.claimRequest.findUnique({ where: { id: claimId } });
  if (!claim) throw new Error("Claim not found");

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: claim.listingId },
      data: { claimedAt: new Date(), userId: claim.userId },
    }),
    prisma.claimRequest.update({
      where: { id: claimId },
      data: { status: "APPROVED", reviewedAt: new Date() },
    }),
    // Any other pending claims on the same listing are now moot.
    prisma.claimRequest.updateMany({
      where: { listingId: claim.listingId, id: { not: claimId }, status: "PENDING" },
      data: { status: "REJECTED", reviewedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/claims");
  revalidatePath("/directory");
}

export async function rejectClaim(claimId: string) {
  await assertAdmin();
  await prisma.claimRequest.update({
    where: { id: claimId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  revalidatePath("/admin/claims");
}

// ---------------------------------------------------------------------------
// Reviews & favorites
// ---------------------------------------------------------------------------

export async function submitReview(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in" };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.review.upsert({
      where: { listingId_userId: { listingId: parsed.data.listingId, userId: session.user.id } },
      create: { ...parsed.data, userId: session.user.id },
      update: { rating: parsed.data.rating, comment: parsed.data.comment, isApproved: false },
    });

    revalidatePath(`/directory`);
    return { success: true };
  } catch (error) {
    return { error: friendlyErrorMessage(error) };
  }
}

export async function toggleFavorite(listingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in" };

  try {
    const existing = await prisma.favorite.findUnique({
      where: { listingId_userId: { listingId, userId: session.user.id } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { listingId, userId: session.user.id } });
    return { favorited: true };
  } catch (error) {
    return { error: friendlyErrorMessage(error) };
  }
}

/**
 * Called once right after sign-in with the listing ids a visitor bookmarked
 * anonymously (from localStorage, see lib/hooks/use-local-bookmarks.ts) so
 * they aren't lost when the browser storage is cleared. Silently skips ids
 * that don't exist or are already saved.
 */
export async function mergeLocalBookmarks(listingIds: string[]) {
  const session = await auth();
  if (!session?.user || listingIds.length === 0) return { merged: 0 };

  const ids = listingIds.slice(0, 200);
  const existing = await prisma.listing.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  const result = await prisma.favorite.createMany({
    data: existing.map((l) => ({ listingId: l.id, userId: session.user.id })),
    skipDuplicates: true,
  });

  revalidatePath("/dashboard/bookmarks");
  return { merged: result.count };
}

// ---------------------------------------------------------------------------
// Admin moderation
// ---------------------------------------------------------------------------

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function approveListing(listingId: string) {
  await assertAdmin();
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: "APPROVED", publishedAt: new Date() },
    include: { user: true },
  });

  await sendListingApprovedEmail(
    listing.user.email,
    listing.title,
    `${env.NEXT_PUBLIC_APP_URL}/directory/${listing.slug}`,
  ).catch((e) => console.error("[approveListing] email failed", e));

  revalidatePath("/admin");
  revalidatePath("/directory");
}

export async function rejectListing(listingId: string, reason?: string) {
  await assertAdmin();
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: "REJECTED", rejectedReason: reason },
    include: { user: true },
  });

  await sendListingRejectedEmail(listing.user.email, listing.title, reason).catch((e) =>
    console.error("[rejectListing] email failed", e),
  );

  revalidatePath("/admin");
}

export async function approveReview(reviewId: string) {
  await assertAdmin();
  await prisma.review.update({ where: { id: reviewId }, data: { isApproved: true } });
  revalidatePath("/admin/reviews");
  revalidatePath("/directory");
}

export async function rejectReview(reviewId: string) {
  await assertAdmin();
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath("/admin/reviews");
}

export async function setUserRole(userId: string, role: "USER" | "LISTER" | "ADMIN") {
  await assertAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

/** One-click admin override — independent of the listing's paid plan. */
export async function toggleFeatured(listingId: string) {
  await assertAdmin();
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { isFeatured: true } });
  if (!listing) throw new Error("Listing not found");

  await prisma.listing.update({
    where: { id: listingId },
    data: { isFeatured: !listing.isFeatured },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/directory");
  revalidatePath("/");
}
