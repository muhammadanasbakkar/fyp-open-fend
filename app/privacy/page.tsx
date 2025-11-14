// app/privacy/page.tsx
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-8">
        {/* Breadcrumbs */}
        <div className="text-xs text-slate-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1 text-slate-400">›</span>
          <span>Privacy policy</span>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            How TheraKonnect handles your data
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Privacy policy
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            This privacy policy explains what information TheraKonnect collects, how it is used and how we work with clinics to protect patient and staff data.
          </p>
          <p className="text-[11px] text-slate-500">
            Last updated: 12 November 2025
          </p>
        </header>

        {/* Section: Scope */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">1. Who we are and scope</h2>
          <p className="mt-2 text-sm text-slate-600">
            TheraKonnect is a digital health and practice management platform that helps mental health clinics and independent therapists manage appointments, availability and patient records. 
            This policy applies when you use TheraKonnect as a patient, therapist, receptionist, admin or clinic owner.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            In many cases, your clinic or therapist is the primary custodian or controller of your health records. 
            TheraKonnect acts as a technology provider and processes data on their behalf.
          </p>
        </section>

        {/* Section: Data we collect */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">2. Information we collect</h2>
          <p className="text-sm text-slate-600">
            The exact data collected can vary by clinic configuration, but typically includes:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <span className="font-medium">Account information.</span> Name, contact details, login credentials and role for staff or basic demographic details for patients such as gender and date of birth.
            </li>
            <li>
              <span className="font-medium">Identity details.</span> CNIC, last digits of identification numbers and similar fields where the clinic requires them for verification or record keeping.
            </li>
            <li>
              <span className="font-medium">Appointment data.</span> Booked sessions, therapist assignment, time, date, mode of session and status such as scheduled, completed or cancelled.
            </li>
            <li>
              <span className="font-medium">Clinical notes and records.</span> Information added by therapists, including structured notes, uploaded documents and history imported or shared from other providers as allowed by your clinic.
            </li>
            <li>
              <span className="font-medium">Technical and device data.</span> Log data, IP address, browser type, device information and basic usage analytics used to keep the service secure and improve reliability.
            </li>
            <li>
              <span className="font-medium">Support and communications.</span> Messages or requests you send to our support team or that clinic staff log inside the system.
            </li>
          </ul>
        </section>

        {/* Section: Use of information */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">3. How we use information</h2>
          <p className="text-sm text-slate-600">
            We use personal information for purposes such as:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Creating and managing user accounts for patients and staff.</li>
            <li>Scheduling, updating and reminding you about appointments.</li>
            <li>Storing clinical notes and documents for therapists and clinics.</li>
            <li>Enabling secure sharing of prior records when a patient gives permission and a superAdmin approves.</li>
            <li>Monitoring security, preventing misuse and investigating suspicious activity.</li>
            <li>Improving the performance, reliability and usability of TheraKonnect.</li>
            <li>Responding to support requests and operational communications.</li>
          </ul>
          <p className="text-sm text-slate-600">
            Clinics may also use data for their own lawful purposes, such as medical record keeping, billing or compliance with professional guidelines.
          </p>
        </section>

        {/* Section: AI and speech to text */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">4. AI features and speech to text</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect may offer optional features such as speech to text capture for notes or AI assisted summaries to support clinicians. 
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Audio is processed to generate text notes and may be temporarily sent to secure third party providers that specialise in transcription or AI processing.</li>
            <li>Transcribed or AI assisted content is stored as part of the patient record inside TheraKonnect.</li>
            <li>AI outputs may not always be fully accurate and must be reviewed and edited by the clinician before being treated as final.</li>
          </ul>
          <p className="text-sm text-slate-600">
            We do not use patient chat data or clinical notes to train external public AI models. 
            Where we rely on third party AI infrastructure, it is configured to respect healthcare style confidentiality wherever possible.
          </p>
        </section>

        {/* Section: Legal basis */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">5. Legal basis for processing</h2>
          <p className="text-sm text-slate-600">
            The legal basis for processing your information can include:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Performance of a contract, for example to provide the service your clinic has requested.</li>
            <li>Compliance with legal or professional obligations that apply to clinics and clinicians.</li>
            <li>Legitimate interests such as keeping the service secure and reliable, provided your rights are respected.</li>
            <li>Consent, for specific features or data sharing where your clinic or therapist collects it from you.</li>
          </ul>
        </section>

        {/* Section: Sharing */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">6. How information is shared</h2>
          <p className="text-sm text-slate-600">
            We share data only as needed to operate TheraKonnect, comply with law and support clinics.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <span className="font-medium">Within a clinic.</span> Patient data is available to authorised therapists, reception staff and admins according to role based permissions configured by the clinic.
            </li>
            <li>
              <span className="font-medium">Service providers.</span> Infrastructure, hosting, email, SMS, analytics, file storage or AI processing providers that help us operate TheraKonnect under appropriate confidentiality terms.
            </li>
            <li>
              <span className="font-medium">Legal and safety.</span> When required by applicable law, court order or to respond to a legal request. 
              We may also disclose information when we believe it is necessary to prevent serious harm or address security incidents.
            </li>
          </ul>
          <p className="text-sm text-slate-600">
            We do not sell patient or staff personal data for advertising purposes.
          </p>
        </section>

        {/* Section: Retention */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">7. Data retention</h2>
          <p className="text-sm text-slate-600">
            We keep personal information for as long as it is needed to provide the service, meet legal obligations and fulfil the needs of clinics and patients.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Clinic and patient records are typically retained according to local medical record retention rules set by the clinic or applicable law.</li>
            <li>Technical logs are retained for a shorter period for security and troubleshooting, then deleted or anonymised.</li>
          </ul>
        </section>

        {/* Section: Security */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">8. Security and storage</h2>
          <p className="text-sm text-slate-600">
            We use a combination of technical and organisational measures to protect data inside TheraKonnect.
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Encryption in transit and at rest for core data stores where practical.</li>
            <li>Role based access control, audit trails and least privilege principles for staff access.</li>
            <li>Regular updates and monitoring of infrastructure to address vulnerabilities.</li>
          </ul>
          <p className="text-sm text-slate-600">
            No system can be guaranteed to be perfectly secure. 
            Clinics should keep their own devices and networks secure and ensure staff follow good security practices such as strong passwords and avoiding credential sharing.
          </p>
        </section>

        {/* Section: International transfers */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">9. International data transfers</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect may use infrastructure or service providers located in other countries. 
            When data is transferred across borders, we aim to put protections in place that are consistent with applicable data protection requirements.
          </p>
        </section>

        {/* Section: Your rights */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">10. Your choices and rights</h2>
          <p className="text-sm text-slate-600">
            Depending on local law and clinic policies, you may have rights such as:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Accessing your personal information and certain parts of your record.</li>
            <li>Requesting corrections to inaccurate or incomplete information.</li>
            <li>Requesting copies of records or their transfer to another provider, subject to clinic rules.</li>
            <li>Objecting to certain uses of your information where permitted by law.</li>
          </ul>
          <p className="text-sm text-slate-600">
            In practice, many of these rights will be handled by your clinic or therapist, rather than directly by TheraKonnect. 
            If you have a question about your record, it is usually best to contact your clinic first.
          </p>
        </section>

        {/* Section: Children */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">11. Children and minors</h2>
          <p className="text-sm text-slate-600">
            TheraKonnect can be used to store records for children and adolescents when a clinic provides such services. 
            Clinics are responsible for ensuring they obtain appropriate consent from parents or legal guardians and that access rights are configured correctly.
          </p>
        </section>

        {/* Section: Changes */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">12. Changes to this policy</h2>
          <p className="text-sm text-slate-600">
            We may update this Privacy Policy from time to time to reflect changes in law, technology or how TheraKonnect operates. 
            When we make significant changes, we will update the “Last updated” date above and may notify clinic admins inside the platform.
          </p>
        </section>

        {/* Section: Contact */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">13. Contact us</h2>
          <p className="text-sm text-slate-600">
            If you have questions about this Privacy Policy or how your data is handled in TheraKonnect, you can reach out to:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Your clinic or therapist, for questions about your own patient record.</li>
            <li>The TheraKonnect support team, using the contact email or support channel provided in your clinic onboarding information.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
