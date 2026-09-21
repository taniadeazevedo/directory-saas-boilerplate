import { BookmarksMerge } from "@/components/dashboard/bookmarks-merge";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BookmarksMerge />
      {children}
    </>
  );
}
