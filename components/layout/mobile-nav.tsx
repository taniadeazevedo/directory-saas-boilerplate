"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

type MobileNavProps = {
  links: { href: string; label: string }[];
  menuLabel: string;
  session: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    dashboardLabel: string;
    administrationLabel: string;
    publishListingLabel: string;
    signInLabel: string;
    createAccountLabel: string;
  };
};

export function MobileNav({ links, menuLabel, session }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={menuLabel}
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent side="right" className="w-4/5">
        <SheetHeader>
          <SheetTitle>{menuLabel}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t p-4">
          {session.isAuthenticated ? (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href="/listing/new">
                    <Plus className="mr-1 h-4 w-4" /> {session.publishListingLabel}
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="ghost">
                  <Link href="/dashboard">{session.dashboardLabel}</Link>
                </Button>
              </SheetClose>
              {session.isAdmin && (
                <SheetClose asChild>
                  <Button asChild variant="ghost">
                    <Link href="/admin">{session.administrationLabel}</Link>
                  </Button>
                </SheetClose>
              )}
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href="/login">{session.signInLabel}</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/register">{session.createAccountLabel}</Link>
                </Button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
