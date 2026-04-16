import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read TheraKonnect's privacy policy to understand how we collect, use, and protect your personal and health information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Privacy Policy | TheraKonnect",
    description: "How TheraKonnect handles and protects your personal data.",
    url: "/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
