import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Inteligencia Artificial", icon: "Bot" },
  { name: "Diseño", icon: "Palette" },
  { name: "Desarrollo", icon: "Code" },
  { name: "Marketing", icon: "Megaphone" },
  { name: "Productividad", icon: "CheckSquare" },
  { name: "Finanzas", icon: "Wallet" },
  { name: "Analítica", icon: "BarChart" },
  { name: "Atención al cliente", icon: "Headset" },
  { name: "Ventas", icon: "TrendingUp" },
  { name: "Recursos Humanos", icon: "Users" },
  { name: "Educación", icon: "GraduationCap" },
  { name: "SEO", icon: "Search" },
  { name: "Redes sociales", icon: "Share2" },
  { name: "Video", icon: "Video" },
  { name: "Fotografía", icon: "Camera" },
  { name: "Automatización", icon: "Workflow" },
  { name: "Colaboración", icon: "Users2" },
  { name: "Seguridad", icon: "Shield" },
  { name: "No-code", icon: "Blocks" },
  { name: "APIs y datos", icon: "Database" },
];

const BADGE_TAGS = ["freemium", "open-source", "self-hosted", "api", "chrome-extension", "mobile"];

async function main() {
  console.log("🌱 Seeding...");

  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.clickEvent.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const demoPassword = await bcrypt.hash("demo1234", 10);
  const demoUsers = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: i === 0 ? "demo@example.com" : faker.internet.email().toLowerCase(),
          password: demoPassword,
          role: "USER",
        },
      }),
    ),
  );

  const categories = await Promise.all(
    CATEGORIES.map((c) =>
      prisma.category.create({
        data: {
          name: c.name,
          slug: faker.helpers.slugify(c.name).toLowerCase(),
          icon: c.icon,
          description: `Las mejores herramientas de ${c.name.toLowerCase()}.`,
        },
      }),
    ),
  );

  const allUsers = [admin, ...demoUsers];

  for (let i = 0; i < 50; i++) {
    const title = `${faker.company.name()} ${faker.helpers.arrayElement(["AI", "Hub", "Studio", "Labs", "Pro", "Cloud"])}`;
    const category = faker.helpers.arrayElement(categories);
    const owner = faker.helpers.arrayElement(allUsers);
    const plan = faker.helpers.weightedArrayElement([
      { value: "BASIC", weight: 6 },
      { value: "FEATURED", weight: 3 },
      { value: "SPONSOR", weight: 1 },
    ]);

    const listing = await prisma.listing.create({
      data: {
        title,
        slug: `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.alphanumeric(6).toLowerCase()}`,
        description: faker.lorem.paragraphs(2),
        websiteUrl: faker.internet.url(),
        logoUrl: `https://api.dicebear.com/9.x/shapes/png?seed=${encodeURIComponent(title)}`,
        images: Array.from({ length: faker.number.int({ min: 0, max: 4 }) }).map(
          () => `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
        ),
        categoryId: category.id,
        tags: faker.helpers.arrayElements(BADGE_TAGS, { min: 1, max: 3 }),
        plan,
        isFeatured: plan !== "BASIC",
        status: "APPROVED",
        publishedAt: faker.date.past({ years: 1 }),
        claimedAt: faker.datatype.boolean(0.4) ? faker.date.past({ years: 1 }) : null,
        viewsCount: faker.number.int({ min: 10, max: 5000 }),
        clicksCount: faker.number.int({ min: 0, max: 800 }),
        userId: owner.id,
      },
    });

    // Spread a sample of click events over the last 14 days so per-listing
    // analytics charts (app/(dashboard)/listing/[id]/analytics) render with
    // real data out of the box instead of an empty chart.
    const sampleClicks = Math.min(listing.clicksCount, 40);
    if (sampleClicks > 0) {
      await prisma.clickEvent.createMany({
        data: Array.from({ length: sampleClicks }).map(() => ({
          listingId: listing.id,
          createdAt: faker.date.recent({ days: 14 }),
        })),
      });
    }

    const favoriters = faker.helpers.arrayElements(allUsers, faker.number.int({ min: 0, max: 4 }));
    for (const user of favoriters) {
      await prisma.favorite.create({ data: { listingId: listing.id, userId: user.id } }).catch(() => {});
    }

    const reviewCount = faker.number.int({ min: 0, max: 6 });
    const reviewers = faker.helpers.arrayElements(allUsers, reviewCount);
    for (const reviewer of reviewers) {
      await prisma.review.create({
        data: {
          listingId: listing.id,
          userId: reviewer.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          comment: faker.lorem.sentence(),
          isApproved: true,
        },
      });
    }
  }

  // A couple of PENDING listings for the admin to moderate out of the box.
  const pendingCategory = faker.helpers.arrayElement(categories);
  for (let i = 0; i < 3; i++) {
    const title = `${faker.company.name()} Beta`;
    await prisma.listing.create({
      data: {
        title,
        slug: `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.alphanumeric(6).toLowerCase()}`,
        description: faker.lorem.paragraphs(2),
        websiteUrl: faker.internet.url(),
        categoryId: pendingCategory.id,
        tags: faker.helpers.arrayElements(BADGE_TAGS, { min: 1, max: 2 }),
        status: "PENDING",
        userId: faker.helpers.arrayElement(demoUsers).id,
      },
    });
  }

  // A demo claim request, so the admin sees something real in /admin/claims
  // right after seeding instead of an empty state.
  const demoUser = demoUsers[0];
  const unclaimedListing = await prisma.listing.findFirst({
    where: { status: "APPROVED", claimedAt: null, userId: { not: demoUser.id } },
  });
  if (unclaimedListing) {
    await prisma.claimRequest.create({
      data: {
        listingId: unclaimedListing.id,
        userId: demoUser.id,
        message: "Soy el fundador de esta empresa, puedo verificarlo desde nuestro dominio corporativo.",
      },
    });
  }

  console.log("✅ Seed complete");
  console.log("   Admin login: admin@example.com / admin1234");
  console.log("   Demo user:   demo@example.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
