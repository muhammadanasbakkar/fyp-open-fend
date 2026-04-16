import { Metadata } from "next";
import { Suspense } from "react";
import FindTherapistClient, { ListResponse } from "./FindTherapistClient";
import { TherapistCardProps } from "@/components/TherapistCard";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const FILTER_KEYS = [
  "q", "city", "modality", "concern",
  "population", "setting", "feeMin", "feeMax", "sort",
] as const;

type SearchParams = Partial<Record<typeof FILTER_KEYS[number] | "page" | "limit", string>>;

// Server-side fetch — result goes straight into the initial HTML Google crawls
async function fetchTherapists(params: SearchParams): Promise<ListResponse | null> {
  const qs = new URLSearchParams();
  FILTER_KEYS.forEach((k) => { if (params[k]) qs.set(k, params[k]!); });
  qs.set("page", params.page || "1");
  qs.set("limit", params.limit || "12");

  try {
    const res = await fetch(`${API}/api/public/therapists?${qs.toString()}`, {
      next: { revalidate: 300 }, // 5-minute cache — fresh enough, fast enough
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Find a Therapist in Pakistan",
  description:
    "Browse verified therapists in Pakistan. Filter by city, specialization, therapy modality, fee range, and care setting. Book online or in-clinic sessions instantly.",
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
    "find therapist Pakistan",
    "therapist near me",
    "online therapist Pakistan",
    "book therapy session",
    "CBT therapist Pakistan",
    "anxiety counselor",
    "depression therapist",
    "Karachi therapist",
    "Lahore therapist",
    "Islamabad therapist",
  ],
  alternates: { canonical: "/appointments/find-therapist" },
  openGraph: {
    title: "Find a Therapist in Pakistan | TheraKonnect",
    description:
      "Browse and filter verified therapists across Pakistan. Book online or in-clinic mental health sessions.",
    url: "/appointments/find-therapist",
  },
};

// ItemList JSON-LD — tells Google this page is a directory of therapist profiles
function buildItemListJsonLd(items: TherapistCardProps[]) {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://therakonnect.com";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified Therapists in Pakistan",
    description: "Browse licensed therapists across Pakistan on TheraKonnect",
    url: `${SITE}/appointments/find-therapist`,
    numberOfItems: items.length,
    itemListElement: items.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/therapists/${t._id}`,
      name: t.name,
    })),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const initialData = await fetchTherapists(params);

  return (
    <>
      {initialData?.items?.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildItemListJsonLd(initialData.items)),
          }}
        />
      ) : null}
      {/* Suspense is required because FindTherapistClient uses useSearchParams() */}
      <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading…</div>}>
        <FindTherapistClient initialData={initialData} />
      </Suspense>
    </>
  );
}
