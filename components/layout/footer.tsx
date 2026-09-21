import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} Directory. {t("rights")}
        </p>
        <div className="flex gap-6">
          <Link href="/directory" className="hover:text-foreground">
            {t("directory")}
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            {t("pricing")}
          </Link>
          <Link href="/listing/new" className="hover:text-foreground">
            {t("publish")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
