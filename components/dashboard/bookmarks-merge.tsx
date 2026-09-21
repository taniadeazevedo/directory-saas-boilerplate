"use client";

import { useEffect, useRef } from "react";
import { useLocalBookmarkIds } from "@/lib/hooks/use-local-bookmarks";
import { mergeLocalBookmarks } from "@/lib/actions";

/**
 * Mounted once on the dashboard. Signed-in users may have bookmarked
 * listings anonymously before creating an account (stored in localStorage —
 * see lib/hooks/use-local-bookmarks.ts); this migrates those into the
 * database and clears local storage so they aren't duplicated or lost.
 */
export function BookmarksMerge() {
  const { ids, clear } = useLocalBookmarkIds();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || ids.length === 0) return;
    didRun.current = true;
    mergeLocalBookmarks(ids).then(() => clear());
  }, [ids, clear]);

  return null;
}
