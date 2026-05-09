// app/layout.tsx
import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth";
import { Metadata, Viewport } from "next";
import TherapistChatbot from "@/components/TherapistChatbot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://therakonnect.com";

// Tells mobile browsers to render the page at the device's pixel width
// (not Next.js's default 980px assumption), which is what makes Tailwind's
// sm:/md:/lg: breakpoints actually fire on phones.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Find and Book a Therapist Online | TheraKonnect",
    template: "%s | TheraKonnect",
  },
  description:
    "Book appointments with verified therapists in Pakistan. Search by city, specialty, or condition and consult online or in-clinic. Mental healthcare made accessible.",
  keywords: [
    "therapist",
    "therapist Pakistan",
    "TheraKonnect",
    "Thera Konnect",
    "therakonnect",
    "thera konnect",
    "TheraConnect",
    "Thera Connect",
    "theraconnect",
    "thera connect",
    "online therapy Pakistan",
    "mental health Pakistan",
    "book therapist",
    "psychologist Pakistan",
    "counselor Pakistan",
    "CBT therapist",
    "anxiety therapy",
    "depression therapy",
  ],
  authors: [{ name: "TheraKonnect" }],
  creator: "TheraKonnect",
  publisher: "TheraKonnect",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: "TheraKonnect",
    title: "Find and Book a Therapist Online | TheraKonnect",
    description:
      "Book appointments with verified therapists in Pakistan. Search by city, specialty, or condition and consult online or in-clinic.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@therakonnect",
    creator: "@therakonnect",
    title: "Find and Book a Therapist Online | TheraKonnect",
    description:
      "Book appointments with verified therapists in Pakistan. Online or in-clinic mental healthcare.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <TherapistChatbot />
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
