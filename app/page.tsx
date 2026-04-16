import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://therakonnect.com";

// Override the root layout's title template with an absolute title for the homepage
export const metadata: Metadata = {
  title: {
    absolute: "Find and Book a Therapist in Pakistan | TheraKonnect",
  },
  description:
    "Browse 25,000+ verified therapists across 70+ cities in Pakistan. Filter by specialty, city, and fee. Book online or in-clinic mental health sessions in under a minute.",
  keywords: [
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
    "book therapist online Pakistan",
    "mental health Pakistan",
    "online therapy Pakistan",
    "best therapist Karachi",
    "best therapist Lahore",
    "best therapist Islamabad",
    "anxiety therapist Pakistan",
    "depression counselor Pakistan",
    "CBT therapist Pakistan",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    url: SITE,
    title: "Find and Book a Therapist in Pakistan | TheraKonnect",
    description:
      "Browse 25,000+ verified therapists across Pakistan. Book online or in-clinic mental health sessions in under a minute.",
  },
};

// ── WebSite JSON-LD — enables Google Sitelinks search box ────────────────────
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TheraKonnect",
  url: SITE,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE}/appointments/find-therapist?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ── Organization JSON-LD — brand knowledge panel ─────────────────────────────
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TheraKonnect",
  url: SITE,
  logo: `${SITE}/favicon.svg`,
  description:
    "Pakistan's digital mental healthcare platform connecting patients with verified, licensed therapists for online and in-clinic sessions.",
  foundingCountry: "PK",
  areaServed: {
    "@type": "Country",
    name: "Pakistan",
  },
  knowsAbout: [
    "Mental Health",
    "Psychotherapy",
    "Counseling",
    "Online Therapy",
    "CBT",
    "Mental Healthcare Pakistan",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "Urdu"],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
