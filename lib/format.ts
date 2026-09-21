export function formatCurrency(amount: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(date: Date | string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(date));
}

export function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

/** Lowercase, accent-free, hyphenated slug base (no uniqueness suffix). */
export function slugifyBase(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
