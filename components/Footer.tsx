import Link from "next/link";
import Image from "next/image";
import logoImage from "@/public/logo.svg";

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

// ── small reusable bits ──────────────────────────────────────────────────────
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <span className="relative">
          {children}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#4b7eff] to-[#7c3aed] transition-all group-hover:w-full" />
        </span>
      </Link>
    </li>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white/95">
      {children}
    </h4>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-[#4b7eff] hover:to-[#7c3aed] hover:text-white hover:ring-white/20"
    >
      {children}
    </a>
  );
}

// ── footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden bg-[#0b1120] text-slate-300">
      {/* Glow + gradient accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 0%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(50% 50% at 10% 0%, rgba(75,126,255,0.18), transparent 60%)",
        }}
      />
      {/* Top hairline gradient */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4b7eff] to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Top: brand + lists ─────────────────────────────────────────── */}
        <div className="grid gap-10 py-12 sm:py-14 md:grid-cols-12 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src={logoImage}
                alt="TheraKonnect"
                width={44}
                height={44}
                className="rounded-xl bg-white/5 ring-1 ring-white/10"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                Thera<span className="text-[#6aa7ff]">Konnect</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Connecting patients with verified therapists across Pakistan. Book
              appointments and access quality mental healthcare with ease.
            </p>

            {/* Trust pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/20">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified clinicians
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4b7eff]/10 px-2.5 py-1 text-[11px] font-medium text-[#9ab8ff] ring-1 ring-[#4b7eff]/20">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Confidential by design
              </span>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-2.5">
              <SocialLink href="https://twitter.com" label="Twitter / X">
                <TwitterIcon />
              </SocialLink>
              <SocialLink href="https://linkedin.com" label="LinkedIn">
                <LinkedInIcon />
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialLink>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-7 sm:grid-cols-3">
            <div>
              <ColumnHeading>For patients</ColumnHeading>
              <ul className="space-y-2.5">
                <FooterLink href="/appointments/find-therapist">Find a therapist</FooterLink>
                <FooterLink href="/appointments/book">Book appointment</FooterLink>
                <FooterLink href="/appointments/my">My appointments</FooterLink>
              </ul>
            </div>

            <div>
              <ColumnHeading>For therapists</ColumnHeading>
              <ul className="space-y-2.5">
                <FooterLink href="/register/staff">Join as therapist</FooterLink>
                <FooterLink href="/availability">Manage availability</FooterLink>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <ColumnHeading>Company</ColumnHeading>
              <ul className="space-y-2.5">
                <FooterLink href="/about">About us</FooterLink>
                <FooterLink href="/privacy">Privacy policy</FooterLink>
                <FooterLink href="/terms">Terms &amp; conditions</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Crisis-support strip ─────────────────────────────────────────── */}
        {/* <div className="mb-8 overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 sm:px-5">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3.75h.008v.008H12v-.008z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-white">In crisis or feeling unsafe?</p>
                <p className="text-xs text-slate-400">
                  TheraKonnect isn&apos;t a substitute for emergency care. If you or someone you know is in danger, please reach out immediately.
                </p>
              </div>
            </div>
            <a
              href="tel:1166"
              className="shrink-0 rounded-xl bg-rose-500/90 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-500"
            >
              Helpline 1166
            </a>
          </div>
        </div> */}
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="relative border-t border-white/5 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs sm:flex-row sm:px-6 sm:text-left">
          <p className="text-slate-500">
            © {year} <span className="font-semibold text-slate-300">TheraKonnect</span>. All rights reserved.
          </p>
          <p className="italic text-slate-600">Built for better mental healthcare access in Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
