import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Therapist",
  description:
    "Register on TheraKonnect as a licensed therapist in Pakistan. Reach more patients, manage your schedule, and deliver online or in-clinic therapy sessions.",
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
    "join as therapist Pakistan",
    "therapist registration Pakistan",
    "list practice TheraKonnect",
    "therapist onboarding",
    "mental health professional Pakistan",
  ],
  alternates: { canonical: "/register/staff" },
  openGraph: {
    title: "Join TheraKonnect as a Therapist",
    description:
      "Register as a verified therapist on TheraKonnect and connect with patients across Pakistan. Manage bookings and sessions in one platform.",
    url: "/register/staff",
  },
};

export default function RegisterStaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
