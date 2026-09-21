import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const PLAN_KEYS = ["basic", "featured", "sponsor"] as const;

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const plans = PLAN_KEYS.map((key) => ({
    key,
    name: t(`${key}.name`),
    price: key === "basic" ? t("free") : key === "featured" ? "$29" : "$99",
    period: key === "basic" ? undefined : t("perMonth"),
    description: t(`${key}.description`),
    features: t.raw(`${key}.features`) as string[],
    cta: t(`${key}.cta`),
    highlighted: key === "featured",
  }));

  return (
    <div className="relative overflow-hidden">
      <div className="mesh-glow absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-5xl px-4 py-20">
        <Reveal className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("heading")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subheading")}</p>
        </Reveal>

        <StaggerGroup className="grid gap-6 md:grid-cols-3" stagger={0.08}>
          {plans.map((plan) => (
            <StaggerItem key={plan.key}>
              <Card
                className={cn(
                  "card-hover relative h-full overflow-hidden",
                  plan.highlighted && "border-primary/40 shadow-lg shadow-primary/10",
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                )}
                {plan.highlighted && (
                  <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary to-accent px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    {t("popular")}
                  </span>
                )}
                <CardHeader className="relative">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="mb-6 space-y-2.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    <Link href="/listing/new">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
