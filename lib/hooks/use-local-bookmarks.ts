"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "directory:bookmarks";

function readStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fail silently.
  }
}

/**
 * Bookmark persistence for signed-out visitors. Stores listing ids in
 * localStorage, scoped to this browser only. `useLocalBookmarkIds` gives the
 * full list (used by the dashboard/bookmarks fallback and the merge-on-login
 * flow); `useIsLocalBookmarked` is the lightweight per-card version.
 */
export function useLocalBookmarkIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readStoredIds());
  }, []);

  const toggle = useCallback((listingId: string) => {
    setIds((prev) => {
      const next = prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId];
      writeStoredIds(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStoredIds([]);
    setIds([]);
  }, []);

  return { ids, toggle, clear };
}

export function useIsLocalBookmarked(listingId: string) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(readStoredIds().includes(listingId));
  }, [listingId]);

  const toggle = useCallback(() => {
    const current = readStoredIds();
    const next = current.includes(listingId)
      ? current.filter((id) => id !== listingId)
      : [...current, listingId];
    writeStoredIds(next);
    setFavorited(next.includes(listingId));
  }, [listingId]);

  return { favorited, toggle };
}
