import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { ShieldCheck, Search, LineChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURE_KEYS = [
  { icon: Search, key: "search", className: "sm:col-span-2" },
  { icon: ShieldCheck, key: "verified", className: "" },
  { icon: LineChart, key: "analytics", className: "" },
  { icon: Sparkles, key: "featured", className: "sm:col-span-2" },
] as const;

export async function FeatureBento() {
  const t = await getTranslations("featureBento");

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("heading")}</h2>
        <p className="mt-2 text-muted-foreground">{t("subheading")}</p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {FEATURE_KEYS.map((feature, i) => (
          <Reveal key={feature.key} delay={i * 0.06} className={feature.className}>
            <div className="card-hover h-full rounded-2xl border bg-card p-6">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  "bg-gradient-to-br from-primary/15 to-accent/15 text-primary",
                )}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-medium">{t(`${feature.key}.title`)}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(`${feature.key}.description`)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
