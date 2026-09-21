import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const APP_URL = env.NEXT_PUBLIC_APP_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api"] },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
