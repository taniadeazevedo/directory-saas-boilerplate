import { z } from "zod";

/**
 * Runtime validation for environment variables. Import `env` instead of
 * reading `process.env` directly in server-only modules (Prisma client,
 * Auth.js, Lemon Squeezy, Resend, UploadThing) so a missing or malformed
 * `.env.local` fails fast with a readable message at startup instead of
 * causing a confusing crash deep inside a request handler.
 *
 * Server-only: do not import this from `middleware.ts`, `auth.config.ts`,
 * or any Client Component — it reads secrets that must never reach the
 * Edge runtime bundle or the browser.
 */
const envSchema = z.object({
  // Required for the app to boot at all.
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required — copy .env.example to .env.local and set it"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required — generate one with `npx auth secret`"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL, e.g. http://localhost:3000"),

  // Optional integrations — the app degrades gracefully when unset (Google
  // sign-in hides itself, paid plans/emails/uploads no-op with a console
  // warning), but if SET, the value must be well-formed.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  LEMONSQUEEZY_API_KEY: z.string().optional(),
  LEMONSQUEEZY_STORE_ID: z.string().optional(),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
  LEMONSQUEEZY_VARIANT_FEATURED: z.string().optional(),
  LEMONSQUEEZY_VARIANT_SPONSOR: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  UPLOADTHING_TOKEN: z.string().optional(),

  CRON_SECRET: z.string().optional(),

  // Set to "true" only on the public marketplace demo deployment — shows a
  // dismissible banner with the seeded admin/demo credentials so reviewers
  // can try the app without registering. Leave unset in a real buyer's
  // production deployment.
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const lines = Object.entries(fieldErrors)
      .map(([key, messages]) => `  - ${key}: ${messages?.join(", ")}`)
      .join("\n");

    console.error(
      `\n❌ Invalid or missing environment variables:\n\n${lines}\n\n` +
        `Copy .env.example to .env.local and fill in the required values, then restart the dev server.\n`,
    );

    throw new Error("Invalid environment variables. See the console output above for details.");
  }

  return parsed.data;
}

export const env: Env = loadEnv();
