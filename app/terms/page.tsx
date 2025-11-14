// app/terms/page.tsx
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-8">
        {/* Breadcrumbs */}
        <div className="text-xs text-slate-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1 text-slate-400">›</span>
          <span>Terms and conditions</span>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Legal terms for using TheraKonnect
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Terms and conditions
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            These terms explain how you can use TheraKonnect as a patient, therapist, receptionist or clinic admin. 
            By creating an account or using the platform, you agree to these terms.
          </p>
          <p className="text-[11px] text-slate-500">
            Last updated: 12 November 2025
          </p>
        </header>

        {/* Section: Acceptance */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">1. Acceptance of terms</h2>
          <p className="mt-2 text-sm text-slate-600">
            TheraKonnect is a digital health and practice management platform that helps clinics and therapists manage appointments, availability and patient records. 
            By accessing or using TheraKonnect you agree to be bound by these terms and conditions, any policies referenced here, and any additional terms shown inside the product.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            If you do not agree with these terms, you should not use TheraKonnect.
          </p>
        </section>

        {/* Section: Eligibility and roles */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">2. Eligibility and account roles</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect is designed for licensed professionals, clinic staff and patients who receive care from those professionals.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <span className="font-medium">SuperAdmin and Admin.</span> Manage clinic level settings, staff approvals, availability rules and access control.
            </li>
            <li>
              <span className="font-medium">Therapists.</span> Manage their schedule, write notes, view records as permitted and request access to prior records when required.
            </li>
            <li>
              <span className="font-medium">Receptionists.</span> Support booking, patient intake and schedule management according to permissions set by clinic admins.
            </li>
            <li>
              <span className="font-medium">Patients.</span> Can create an account, view and manage appointments and access their own records where enabled by the clinic.
            </li>
          </ul>
          <p className="text-sm text-slate-600">
            You are responsible for providing accurate information when registering and for keeping your login credentials secure.
          </p>
        </section>

        {/* Section: Clinical responsibility */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">3. No medical advice, clinical responsibility</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect is a tool to organise information and streamline clinic workflows. 
            The platform does not provide medical advice, diagnosis or treatment. 
            All clinical decisions remain the responsibility of the treating therapist, psychiatrist, psychologist or other licensed professional.
          </p>
          <p className="text-sm text-slate-600">
            Patients should always discuss any concerns with their own clinician and should not rely solely on automated messages, reminders or system generated content for medical decisions.
          </p>
          <p className="text-sm text-slate-600">
            TheraKonnect is not designed for emergency situations. 
            If you are in crisis or at risk of harm, you should contact local emergency services or a trusted emergency helpline immediately.
          </p>
        </section>

        {/* Section: Use of platform */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">4. Use of the platform</h2>
          <p className="text-sm text-slate-600">
            You agree to use TheraKonnect only for lawful purposes and in line with your role.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Do not attempt to access data you are not authorised to view.</li>
            <li>Do not share your login credentials with anyone else.</li>
            <li>Do not upload content that is illegal, abusive, discriminatory or violates another person’s rights.</li>
            <li>Do not attempt to disrupt, attack or reverse engineer the platform.</li>
          </ul>
          <p className="text-sm text-slate-600">
            We may suspend or terminate access if we believe your use of TheraKonnect violates these terms or risks the security or privacy of other users.
          </p>
        </section>

        {/* Section: Appointments */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">5. Appointments, cancellations and reminders</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect allows clinics to configure appointment lengths, cancellation rules and reminders.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Each clinic or therapist may define their own cancellation and rescheduling policies.</li>
            <li>Reminder messages are provided as a convenience and may not always be delivered or received on time.</li>
            <li>Patients are responsible for checking the exact time, date and location or mode of their appointment.</li>
          </ul>
        </section>

        {/* Section: AI, speech to text and automation */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">6. AI features, speech to text and automation</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect may include features such as speech to text note taking or AI assisted summaries to help clinicians capture information more efficiently.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>AI generated content may contain errors, omissions or outdated information.</li>
            <li>Therapists must always review and edit AI generated text before relying on it as part of the official patient record.</li>
            <li>Patients should not treat AI generated statements as medical advice.</li>
          </ul>
        </section>

        {/* Section: Privacy and data */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">7. Privacy and data protection</h2>
          <p className="text-sm text-slate-600">
            Our{" "}
            <Link href="/privacy" className="text-[var(--brand,#4b7eff)] hover:underline">
              Privacy Policy
            </Link>{" "}
            explains how we collect, use and protect personal data inside TheraKonnect. 
            By using the platform you also agree to the Privacy Policy.
          </p>
          <p className="text-sm text-slate-600">
            Clinics and therapists may be separate data controllers or custodians under applicable law. 
            They are responsible for configuring access rules and handling any patient requests related to their own records.
          </p>
        </section>

        {/* Section: Intellectual property */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">8. Intellectual property</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect, including its design, code and branding, is owned by its creators or licensors. 
            You receive a limited right to use the platform for your clinic or personal care, subject to these terms. 
            You may not copy, resell, rebrand or create competing services using any part of the platform without written permission.
          </p>
        </section>

        {/* Section: Fees (placeholder) */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">9. Plans, fees and billing</h2>
          <p className="text-sm text-slate-600">
            If your clinic uses a paid plan, fees, billing cycles and cancellation terms will be described in a separate subscription or service agreement. 
            Those commercial terms form part of these terms once accepted.
          </p>
        </section>

        {/* Section: Termination */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">10. Suspension and termination</h2>
          <p className="text-sm text-slate-600">
            We may suspend or terminate access to TheraKonnect for any user who:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Violates these terms or any applicable law.</li>
            <li>Compromises the security or privacy of other users.</li>
            <li>Misuses the platform in a way that harms the service or other users.</li>
          </ul>
          <p className="text-sm text-slate-600">
            Clinics may also deactivate staff accounts when a therapist or receptionist leaves the organisation.
          </p>
        </section>

        {/* Section: Disclaimers */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">11. Disclaimers and limitation of liability</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect is provided on an “as is” and “as available” basis. 
            We do not guarantee uninterrupted access, error free operation or that the platform will meet every clinic’s specific regulatory requirements.
          </p>
          <p className="text-sm text-slate-600">
            To the maximum extent allowed by law, we are not liable for indirect, incidental or consequential damages, loss of data, loss of profits or business interruption arising from your use of TheraKonnect. 
            Clinics and clinicians are responsible for maintaining appropriate offline backups or local records where required by regulation or professional guidelines.
          </p>
        </section>

        {/* Section: Governing law */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">12. Governing law and disputes</h2>
          <p className="text-sm text-slate-600">
            These terms are intended to be governed by the laws that apply in the jurisdiction where TheraKonnect is operated, 
            for example the laws of Pakistan for clinics based in Pakistan, unless a different jurisdiction is explicitly agreed in writing with a clinic.
          </p>
          <p className="text-sm text-slate-600">
            Any disputes should first be raised with us in writing. 
            If a resolution cannot be reached, the dispute may be submitted to the courts that have jurisdiction over our registered office.
          </p>
        </section>

        {/* Section: Changes and contact */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">13. Changes and contact</h2>
          <p className="text-sm text-slate-600">
            We may update these terms from time to time. 
            When we make material changes, we will update the “Last updated” date at the top of this page and, where appropriate, notify clinic admins in the product.
          </p>
          <p className="text-sm text-slate-600">
            If you have questions about these terms, you can contact the TheraKonnect team at the email address shared in your clinic onboarding pack or support channel.
          </p>
        </section>
      </div>
    </div>
  );
}
