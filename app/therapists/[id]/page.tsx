import { Metadata } from "next";
import TherapistProfileClient from "./TherapistProfileClient";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const CDN = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/+$/, "");
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://therakonnect.com";

type TherapistData = {
  therapist: {
    name: string;
    bio?: string;
    profilePicture?: string;
    yearsExperience?: number;
    specializations?: string[];
    modalities?: string[];
    concerns?: string[];
    populations?: string[];
    licensingCouncil?: string;
    fees?: { currency?: string; online?: number; inPerson?: number } | null;
  };
  hospitals: {
    name: string;
    city?: string;
    address?: string;
  }[];
};

async function fetchTherapistData(id: string): Promise<TherapistData | null> {
  try {
    const res = await fetch(`${API}/api/therapists/therapists/${id}`, {
      next: { revalidate: 3600 }, // re-fetch server-side every hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Dynamic metadata — auto-generated for every therapist that onboards ──────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchTherapistData(id);
  const t = data?.therapist;

  if (!t) {
    return {
      title: "Therapist Profile",
      description: "View therapist profile and book a session on TheraKonnect.",
    };
  }

  const specs = (t.specializations || []).slice(0, 3).join(", ");
  const exp = t.yearsExperience
    ? `${t.yearsExperience} year${t.yearsExperience !== 1 ? "s" : ""} experience`
    : "Licensed Therapist";

  const title = specs
    ? `${t.name} – ${specs}`
    : `${t.name} – ${exp}`;

  // Trim bio to ~155 chars for description, falling back to a generated one
  const description = t.bio
    ? t.bio.length > 155
      ? t.bio.slice(0, 152).replace(/\s\S*$/, "") + "…"
      : t.bio
    : `Book a session with ${t.name}, a verified therapist${specs ? ` specialising in ${specs}` : ""} on TheraKonnect – Pakistan's mental healthcare platform.`;

  const imageUrl = t.profilePicture
    ? `${CDN}/${t.profilePicture.replace(/^\//, "")}`
    : undefined;

  const canonicalUrl = `${SITE}/therapists/${id}`;

  // Cities where therapist practices (for keywords)
  const cities = (data?.hospitals || [])
    .map((h) => h.city)
    .filter(Boolean) as string[];

  const keywords = [
    t.name,
    "therapist",
    "TheraKonnect",
    "Thera Konnect",
    "therakonnect",
    "thera konnect",
    "TheraConnect",
    "Thera Connect",
    "theraconnect",
    "thera connect",
    "therapist Pakistan",
    ...(t.specializations || []),
    ...(t.modalities || []).slice(0, 3),
    ...cities,
    "book therapist",
    "mental health Pakistan",
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "profile",
      url: canonicalUrl,
      title,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 400, height: 400, alt: `${t.name} – TheraKonnect` }]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

// ── Page — server component wrapping the client UI ────────────────────────────
export default async function TherapistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchTherapistData(id);
  const t = data?.therapist;

  // Build JSON-LD (Schema.org Person) for rich search results
  const jsonLd = t
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: t.name,
        jobTitle: "Licensed Therapist",
        description:
          t.bio ||
          `Verified therapist on TheraKonnect, Pakistan's mental healthcare platform.`,
        ...(t.profilePicture && {
          image: `${CDN}/${t.profilePicture.replace(/^\//, "")}`,
        }),
        url: `${SITE}/therapists/${id}`,
        ...(t.licensingCouncil && {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: t.licensingCouncil,
          },
        }),
        ...(t.specializations?.length && {
          knowsAbout: [
            ...(t.specializations || []),
            ...(t.modalities || []),
          ],
        }),
        // Clinic locations as worksLocation
        ...((data?.hospitals?.length ?? 0) > 0 && {
          worksLocation: data!.hospitals.map((h) => ({
            "@type": "MedicalClinic",
            name: h.name,
            ...(h.address && { address: h.address }),
            ...(h.city && {
              address: {
                "@type": "PostalAddress",
                addressLocality: h.city,
                addressCountry: "PK",
              },
            }),
          })),
        }),
        // Offer for booking
        makesOffer: {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Therapy Session",
            provider: { "@type": "Person", name: t.name },
          },
          url: `${SITE}/appointments/book?therapist=${id}`,
          ...(t.fees?.online != null && {
            price: t.fees.online,
            priceCurrency: t.fees.currency || "PKR",
          }),
        },
      }
    : null;

  // BreadcrumbList for rich results in Google
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Find a Therapist",
        item: `${SITE}/appointments/find-therapist`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t?.name ?? "Therapist Profile",
        item: `${SITE}/therapists/${id}`,
      },
    ],
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TherapistProfileClient />
    </>
  );
}
