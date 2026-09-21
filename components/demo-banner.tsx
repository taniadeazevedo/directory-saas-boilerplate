"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, X, Copy } from "lucide-react";
import { toast } from "sonner";

const ADMIN_CREDENTIALS = { email: "admin@example.com", password: "admin1234" };
const USER_CREDENTIALS = { email: "demo@example.com", password: "demo1234" };

function CredentialPill({ label, email, password, t }: { label: string; email: string; password: string; t: ReturnType<typeof useTranslations> }) {
  function copy() {
    navigator.clipboard.writeText(`${email} / ${password}`).then(() => toast.success(t("copied")));
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs transition-colors hover:bg-primary-foreground/20"
    >
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{email}</span>
      <span className="opacity-70">/</span>
      <span className="font-mono">{password}</span>
      <Copy className="h-3 w-3 opacity-70" />
    </button>
  );
}

/** Only rendered when NEXT_PUBLIC_DEMO_MODE="true" — see app/layout.tsx. */
export function DemoBanner() {
  const t = useTranslations("demoBanner");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 pr-8 text-center sm:text-left">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
          <Sparkles className="h-3.5 w-3.5" /> {t("label")}
        </span>
        <span className="text-sm opacity-95">{t("text")}</span>
        <div className="flex flex-wrap justify-center gap-2">
          <CredentialPill label={t("admin")} email={ADMIN_CREDENTIALS.email} password={ADMIN_CREDENTIALS.password} t={t} />
          <CredentialPill label={t("user")} email={USER_CREDENTIALS.email} password={USER_CREDENTIALS.password} t={t} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("dismiss")}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-primary-foreground/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
