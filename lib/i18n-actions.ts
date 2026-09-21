"use server";

import { cookies } from "next/headers";
import { locales, type Locale } from "@/i18n/config";

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
}
