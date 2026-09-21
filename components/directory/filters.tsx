"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { translateCategory } from "@/lib/category-i18n";

export type CategoryOption = { slug: string; name: string; count: number };

export function Filters({ categories }: { categories: CategoryOption[] }) {
  const t = useTranslations("filters");
  const tCategories = useTranslations("categories");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentCategory = searchParams.get("category");
  const currentPrice = searchParams.get("price");
  const currentBadge = searchParams.get("badge");
  const currentView = searchParams.get("view") ?? "grid";
  const currentSort = searchParams.get("sort") ?? "newest";

  return (
    <aside className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs uppercase text-muted-foreground">{t("view")}</Label>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            size="sm"
            variant={currentView === "grid" ? "secondary" : "ghost"}
            className="flex-1"
            onClick={() => setParam("view", "grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={currentView === "list" ? "secondary" : "ghost"}
            className="flex-1"
            onClick={() => setParam("view", "list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-xs uppercase text-muted-foreground">{t("sortBy")}</Label>
        <Select value={currentSort} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("newest")}</SelectItem>
            <SelectItem value="popular">{t("popular")}</SelectItem>
            <SelectItem value="rating">{t("rating")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <Label className="mb-2 block text-xs uppercase text-muted-foreground">{t("price")}</Label>
        <div className="space-y-2">
          {[
            { value: "free", label: t("free") },
            { value: "paid", label: t("paid") },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={currentPrice === opt.value}
                onCheckedChange={(checked) => setParam("price", checked ? opt.value : null)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-2 block text-xs uppercase text-muted-foreground">{t("badges")}</Label>
        <div className="space-y-2">
          {[
            { value: "verified", label: t("verified") },
            { value: "featured", label: t("featured") },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={currentBadge === opt.value}
                onCheckedChange={(checked) => setParam("badge", checked ? opt.value : null)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-2 block text-xs uppercase text-muted-foreground">{t("categories")}</Label>
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          <button
            onClick={() => setParam("category", null)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
              !currentCategory && "bg-muted font-medium",
            )}
          >
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setParam("category", cat.slug)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                currentCategory === cat.slug && "bg-muted font-medium",
              )}
            >
              <span>{translateCategory(tCategories, cat)}</span>
              <span className="text-xs text-muted-foreground">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
