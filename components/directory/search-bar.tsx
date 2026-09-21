"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

type Suggestion = { title: string; slug: string; logoUrl: string | null };

export function SearchBar({ placeholder }: { placeholder?: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(value)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setSuggestions(data.results ?? []))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  function runSearch(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname === "/" ? "/directory" : pathname}?${params.toString()}`);
    });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runSearch(value);
        }}
        placeholder={placeholder ?? t("placeholder")}
        className="h-12 pl-10 text-base"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-popover text-left shadow-md">
          {suggestions.map((s) => (
            <Link
              key={s.slug}
              href={`/directory/${s.slug}`}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {s.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
