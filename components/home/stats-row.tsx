import { getTranslations } from "next-intl/server";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { Reveal } from "@/components/motion/reveal";

export async function StatsRow({
  stats,
}: {
  stats: { listings: number; categories: number; reviews: number; clicks: number };
}) {
  const t = await getTranslations("stats");

  const items = [
    { label: t("listings"), value: stats.listings, prefix: "+" },
    { label: t("categories"), value: stats.categories, prefix: "" },
    { label: t("reviews"), value: stats.reviews, prefix: "+" },
    { label: t("clicks"), value: stats.clicks, prefix: "+" },
  ];

  return (
    <div className="border-b bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.05} className="text-center">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <AnimatedCounter value={item.value} prefix={item.prefix} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
