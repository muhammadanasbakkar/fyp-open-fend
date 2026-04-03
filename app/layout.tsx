// app/layout.tsx
import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth";
import { Metadata } from "next";
import TherapistChatbot from "@/components/TherapistChatbot";


export const metadata: Metadata = {
  title: "Find and Book Therapist Online | TheraKonnect.com",
  description:
    "Book appointments with the best therapist in Pakistan. Search by city, specialty, or condition and consult online or in clinic.",
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
