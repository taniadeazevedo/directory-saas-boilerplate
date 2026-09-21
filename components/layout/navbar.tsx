import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LayoutGrid, Plus } from "lucide-react";

export async function Navbar() {
  const [session, t] = await Promise.all([auth(), getTranslations("nav")]);

  const NAV_LINKS = [
    { href: "/directory", label: t("directory") },
    { href: "/pricing", label: t("pricing") },
  ];

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <span>{t("brand")}</span>
        </Link>

        <nav className="max-md:hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileNav
            links={NAV_LINKS}
            menuLabel={t("menu")}
            session={{
              isAuthenticated: Boolean(session?.user),
              isAdmin: session?.user?.role === "ADMIN",
              dashboardLabel: t("dashboard"),
              administrationLabel: t("administration"),
              publishListingLabel: t("publishListing"),
              signInLabel: t("signIn"),
              createAccountLabel: t("createAccount"),
            }}
          />
          {session?.user ? (
            <>
              <Button asChild size="sm" variant="outline" className="max-sm:hidden sm:inline-flex">
                <Link href="/listing/new">
                  <Plus className="mr-1 h-4 w-4" /> {t("publishListing")}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                        {session.user.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">{t("dashboard")}</Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">{t("administration")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form
                      action={async () => {
                        "use server";
                        await signOut();
                      }}
                    >
                      <button type="submit" className="w-full text-left">
                        {t("signOut")}
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="max-sm:hidden sm:inline-flex">
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button asChild size="sm" className="max-sm:hidden sm:inline-flex">
                <Link href="/register">{t("createAccount")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
