import { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://therakonnect.com";
const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

// Fetch all therapist IDs by paginating through the public API
async function fetchAllTherapistIds(): Promise<string[]> {
  const ids: string[] = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      const res = await fetch(
        `${API}/api/public/therapists?page=${page}&limit=${limit}`,
        { next: { revalidate: 86400 } } // revalidate sitemap once a day
      );
      if (!res.ok) break;

      const data = await res.json();
      const items: { _id: string }[] = data.items || [];
      if (!items.length) break;

      ids.push(...items.map((t) => t._id));

      // Stop if we got fewer than limit (last page)
      if (items.length < limit) break;
      page++;
    }
  } catch {
    // Return whatever we collected so far — don't fail the whole sitemap
  }

  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE}/appointments/find-therapist`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE}/appointments/book`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/register/staff`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── Dynamic therapist pages — auto-added as therapists onboard ──────────────
  const therapistIds = await fetchAllTherapistIds();
  const therapistRoutes: MetadataRoute.Sitemap = therapistIds.map((id) => ({
    url: `${SITE}/therapists/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...therapistRoutes];
}
