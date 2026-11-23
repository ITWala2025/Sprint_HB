import { MetadataRoute } from "next";
import siteConfig from "@/config/site.config.json";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/staff/",
          "/student/",
          "/api/",
          "/login",
          "/forgot-password",
          "/set-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}