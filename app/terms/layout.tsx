import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read TheraKonnect's terms and conditions governing the use of our mental healthcare booking platform.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Terms and Conditions | TheraKonnect",
    description: "Terms governing the use of TheraKonnect's platform.",
    url: "/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
