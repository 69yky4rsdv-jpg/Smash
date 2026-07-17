import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/store-checkout";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/auth/",
          "/profile",
          "/store/success",
          "/store/*/checkout",
          "/store/*/signup",
          "/store/*/watch",
          "/store/*/purchase",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
