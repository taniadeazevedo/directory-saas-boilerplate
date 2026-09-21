/**
 * Adds a handful of hand-written, realistic listings (real English copy, no
 * Lorem Ipsum) on top of the regular faker-based seed — purely so marketing
 * screenshots for the template listing look presentable. Not part of the
 * buyer-facing `npm run setup` flow.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/seed-showcase.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHOWCASE = [
  {
    title: "FlowSync",
    category: "Automatización", // Automation
    description:
      "FlowSync connects the tools your team already uses — Slack, Notion, Linear, Gmail — into automated workflows that run themselves. Build a flow in minutes with a visual editor, no code required, and get notified the moment something needs your attention.",
    tags: ["automation", "no-code", "freemium"],
    isFeatured: true,
    reviews: [
      { rating: 5, comment: "Replaced three separate Zapier flows with one FlowSync automation. Setup took ten minutes." },
      { rating: 5, comment: "The visual editor is genuinely intuitive — our ops team was building flows on day one." },
    ],
  },
  {
    title: "ScreenCast Pro",
    category: "Video",
    description:
      "Record crisp product walkthroughs, share a link, and see exactly where viewers dropped off. ScreenCast Pro trims the fat out of async video communication — automatic transcripts, one-click editing, and a viewer analytics dashboard built in.",
    tags: ["video", "self-hosted", "chrome-extension"],
    isFeatured: true,
    reviews: [
      { rating: 4, comment: "Cut our onboarding call time in half. The automatic transcripts are a nice touch." },
    ],
  },
  {
    title: "PulseMetrics",
    category: "Analítica", // Analytics
    description:
      "Real-time product analytics without writing a single SQL query. Drop in a snippet, define the events that matter, and get dashboards your whole team can actually read — funnels, retention cohorts, and session replays included.",
    tags: ["api", "freemium"],
    isFeatured: false,
    reviews: [
      { rating: 5, comment: "Finally an analytics tool our PM and our engineers both like using." },
    ],
  },
  {
    title: "Palette Studio",
    category: "Diseño", // Design
    description:
      "A collaborative design system builder for product teams shipping fast. Sync tokens straight into code, keep every Figma file consistent, and stop re-explaining the same spacing rules in every design review.",
    tags: ["freemium", "self-hosted"],
    isFeatured: true,
    reviews: [
      { rating: 4, comment: "Our design-to-dev handoff time dropped noticeably once tokens started syncing automatically." },
    ],
  },
  {
    title: "ChatForge",
    category: "Inteligencia Artificial", // Artificial Intelligence
    description:
      "Build and deploy a custom AI support agent trained on your own docs in under ten minutes. ChatForge handles the retrieval, the guardrails, and the handoff to a human — you just point it at your knowledge base.",
    tags: ["api", "freemium"],
    isFeatured: true,
    reviews: [
      { rating: 5, comment: "Deflected about 40% of our support tickets in the first month. Setup was refreshingly simple." },
      { rating: 4, comment: "Great product — would love more control over the tone of responses." },
    ],
  },
  {
    title: "AudienceIQ",
    category: "Marketing",
    description:
      "Smarter email campaigns powered by predictive audience segmentation. AudienceIQ learns which subscribers are about to churn, which are ready to buy, and sends the right message to each — automatically.",
    tags: ["freemium", "api"],
    isFeatured: false,
    reviews: [],
  },
  {
    title: "FormBuilder Pro",
    category: "No-code",
    description:
      "Drag-and-drop forms that actually convert. Conditional logic, native payments, and integrations with the CRM you already use — publish a polished multi-step form in the time it takes to make coffee.",
    tags: ["no-code", "freemium"],
    isFeatured: false,
    reviews: [
      { rating: 5, comment: "Migrated off Typeform and haven't looked back — the conditional logic builder is much more flexible." },
    ],
  },
  {
    title: "HelpDeskly",
    category: "Atención al cliente", // Customer Support
    description:
      "The shared inbox your support team will actually enjoy using. HelpDeskly routes tickets by intent, suggests replies from your help center, and shows the full customer history in one place — no more tab-switching.",
    tags: ["freemium", "chrome-extension"],
    isFeatured: true,
    reviews: [
      { rating: 5, comment: "Our first-response time dropped by half within the first two weeks." },
    ],
  },
];

async function main() {
  console.log("🌟 Seeding showcase listings...");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN user found — run the main seed first (npm run db:seed).");

  for (const item of SHOWCASE) {
    const category = await prisma.category.findFirst({ where: { name: item.category } });
    if (!category) {
      console.warn(`  ⚠ category "${item.category}" not found, skipping "${item.title}"`);
      continue;
    }

    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const listing = await prisma.listing.upsert({
      where: { slug },
      create: {
        title: item.title,
        slug,
        description: item.description,
        websiteUrl: `https://${slug}.com`,
        logoUrl: `https://api.dicebear.com/9.x/shapes/png?seed=${encodeURIComponent(item.title)}`,
        images: [
          `https://picsum.photos/seed/${slug}-1/1200/750`,
          `https://picsum.photos/seed/${slug}-2/1200/750`,
        ],
        categoryId: category.id,
        tags: item.tags,
        plan: item.isFeatured ? "FEATURED" : "BASIC",
        isFeatured: item.isFeatured,
        status: "APPROVED",
        publishedAt: new Date(),
        claimedAt: new Date(),
        viewsCount: 800 + Math.floor(Math.random() * 4000),
        clicksCount: 100 + Math.floor(Math.random() * 600),
        userId: admin.id,
      },
      update: {
        description: item.description,
        tags: item.tags,
        isFeatured: item.isFeatured,
        plan: item.isFeatured ? "FEATURED" : "BASIC",
      },
    });

    for (const review of item.reviews) {
      const reviewer = await prisma.user.findFirst({ where: { role: "USER" }, skip: Math.floor(Math.random() * 3) });
      if (!reviewer) continue;
      await prisma.review
        .upsert({
          where: { listingId_userId: { listingId: listing.id, userId: reviewer.id } },
          create: { listingId: listing.id, userId: reviewer.id, rating: review.rating, comment: review.comment, isApproved: true },
          update: { rating: review.rating, comment: review.comment, isApproved: true },
        })
        .catch(() => {});
    }

    console.log(`  ✓ ${item.title}`);
  }

  console.log("✅ Showcase listings ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
