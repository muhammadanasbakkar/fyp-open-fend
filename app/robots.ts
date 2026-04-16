import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://therakonnect.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/appointments/find-therapist",
          "/appointments/book",
          "/therapists/",
          "/about",
          "/privacy",
          "/terms",
          "/register/staff",
        ],
        disallow: [
          "/admin/",
          "/dashboard/",
          "/patient-records/",
          "/receptionist/",
          "/supervisor/",
          "/reports/",
          "/availability/",
          "/hospital/",
          "/appointments/my/",
          "/appointments/pending/",
          "/appointments/verify/",
          "/appointments/treatment-plan/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
