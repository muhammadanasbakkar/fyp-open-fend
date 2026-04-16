import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about TheraKonnect — Pakistan's digital mental healthcare platform connecting patients with verified, licensed therapists for online and in-clinic sessions.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About TheraKonnect | Pakistan's Mental Healthcare Platform",
    description:
      "TheraKonnect connects patients with verified therapists across Pakistan. Learn about our mission to make mental healthcare accessible.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
