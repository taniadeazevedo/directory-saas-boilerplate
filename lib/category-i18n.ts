/**
 * Category names live in the database (seeded in whichever language the
 * store owner used) and can't be machine-translated per viewer like static
 * UI copy. For the ~20 categories the seed script ships, `messages/*.json`
 * carries a translation under the `categories` namespace, keyed by slug;
 * anything else (custom categories an admin adds later) falls back to the
 * raw DB value.
 *
 * Pass a translator already scoped to the "categories" namespace, e.g.
 * `useTranslations("categories")` or `getTranslations("categories")`.
 */
type CategoryTranslator = {
  has: (key: string) => boolean;
  (key: string): string;
};

export function translateCategory(t: CategoryTranslator, category: { slug: string; name: string }): string {
  return t.has(category.slug) ? t(category.slug) : category.name;
}
