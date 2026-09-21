"use client";

import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/directory/search-bar";
import { Badge } from "@/components/ui/badge";
import { translateCategory } from "@/lib/category-i18n";

type Category = { slug: string; name: string };

export function Hero({ categories }: { categories: Category[] }) {
  const t = useTranslations("hero");
  const tCategories = useTranslations("categories");

  return (
    <section className="relative overflow-hidden border-b">
      <div className="mesh-glow absolute inset-0 -z-10" />
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            {t("badge")}
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          {t.rich("title", {
            highlight: (chunks) => <span className="text-gradient">{chunks}</span>,
          })}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-xl"
        >
          <Suspense>
            <SearchBar />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              <Badge variant="outline" className="cursor-pointer rounded-full transition-colors hover:bg-secondary">
                {translateCategory(tCategories, cat)}
              </Badge>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
