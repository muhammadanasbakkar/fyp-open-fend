// app/privacy/page.tsx
import Link from "next/link";

const SECTIONS: { id: string; title: string }[] = [
  { id: "introduction", title: "1. Introduction" },
  { id: "commitment", title: "2. Important Privacy Commitment" },
  { id: "info-we-collect", title: "3. Information We Collect" },
  { id: "patient-policy", title: "A. Patient Privacy Policy" },
  { id: "therapist-policy", title: "B. Therapist Privacy Policy" },
  { id: "supervisor-policy", title: "C. Supervisor Privacy Policy" },
  { id: "superadmin-policy", title: "E. Super Admin Privacy Policy" },
  { id: "general-use", title: "4. How We Use Information Generally" },
  { id: "sharing", title: "5. Sharing and Disclosure of Data" },
  { id: "security", title: "6. Data Security" },
  { id: "retention", title: "7. Data Retention" },
  { id: "deletion", title: "8. Account Closure and Data Deletion" },
  { id: "confidentiality", title: "9. Confidentiality" },
  { id: "minors", title: "10. Children and Minors" },
  { id: "cookies", title: "11. Cookies and Technical Data" },
  { id: "communications", title: "12. Communications" },
  { id: "accuracy", title: "13. Data Accuracy" },
  { id: "international", title: "14. International Hosting or Storage" },
  { id: "breach", title: "15. Breach or Security Incident" },
  { id: "responsibilities", title: "16. User Responsibilities" },
  { id: "changes", title: "17. Changes to This Privacy Policy" },
  { id: "contact", title: "18. Contact Us" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-slate-800">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-600">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1 text-sm leading-relaxed text-slate-600">{children}</ul>;
}

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12 space-y-8">
        {/* Breadcrumbs */}
        <div className="text-xs text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1 text-slate-400">›</span>
          <span>Privacy policy</span>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            How TheraKonnect handles your data
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            TheraKonnect is a digital platform that connects patients with therapists and supports
            clinics, supervisors, and admins managing therapy workflows. This policy explains how we
            collect, use, store, protect, and restrict access to personal data and therapy information.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* TOC */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Contents</p>
            <nav className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <ul className="space-y-0.5 text-xs text-slate-600">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block rounded-md px-2 py-1.5 hover:bg-slate-50 hover:text-slate-900">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <article className="space-y-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            {/* 1. Introduction */}
            <section className="space-y-3">
              <H2 id="introduction">1. Introduction</H2>
              <P>
                TheraKonnect is a digital platform designed to help patients connect with therapists
                and to help therapists, supervisors, and clinics manage therapy-related workflows,
                appointments, records, and patient notes.
              </P>
              <P>This Privacy Policy explains how TheraKonnect collects, uses, stores, protects, and restricts access to personal data and therapy-related information.</P>
              <P>TheraKonnect has different user roles:</P>
              <UL>
                <li>Patient</li>
                <li>Therapist</li>
                <li>Supervisor</li>
                <li>Clinic</li>
                <li>Super Admin</li>
              </UL>
              <P>Each role has different access permissions and privacy responsibilities.</P>
            </section>

            {/* 2. Commitment */}
            <section className="space-y-3">
              <H2 id="commitment">2. Important Privacy Commitment</H2>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  TheraKonnect does not sell, rent, trade, or commercially share patient data.
                </p>
              </div>
              <P>
                Patient records, therapy notes, clinical notes, appointment details, and mental
                health-related information are private and are accessible only to authorized users
                who need access for therapy, supervision, clinic, platform support, security, or legal compliance.
              </P>
              <P>Patient therapy records and notes are primarily for:</P>
              <UL>
                <li>The patient&apos;s therapist</li>
                <li>The therapist&apos;s authorized supervisor</li>
                <li>The authorized clinic, where the patient is receiving services through a clinic</li>
                <li>Restricted TheraKonnect administrative access only where necessary</li>
              </UL>
            </section>

            {/* 3. Information We Collect */}
            <section className="space-y-3">
              <H2 id="info-we-collect">3. Information We Collect</H2>
              <P>TheraKonnect may collect different information depending on the user role.</P>
            </section>

            {/* A. Patient Privacy Policy */}
            <section className="space-y-3">
              <H2 id="patient-policy">A. Patient Privacy Policy</H2>

              <H3>A1. Information Collected from Patients</H3>
              <P>When a patient uses TheraKonnect, we may collect:</P>
              <UL>
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Age or date of birth</li>
                <li>Gender</li>
                <li>City or location</li>
                <li>Login details</li>
                <li>Appointment bookings</li>
                <li>Therapist selection</li>
                <li>Therapy preferences</li>
                <li>Patient history shared by the patient</li>
                <li>Therapy records and clinical notes created by the therapist</li>
                <li>Supervisor review notes, where supervision applies</li>
                <li>Clinic records, where the patient is registered through a clinic</li>
                <li>Payment or billing details, where applicable</li>
                <li>Messages or communication through the platform</li>
                <li>Device, browser, IP address, and login activity</li>
              </UL>

              <H3>A2. How Patient Information Is Used</H3>
              <P>Patient information is used to:</P>
              <UL>
                <li>Create and manage the patient account</li>
                <li>Book and manage therapy appointments</li>
                <li>Connect the patient with therapists</li>
                <li>Allow therapists to provide therapy services</li>
                <li>Maintain therapy notes and patient records</li>
                <li>Allow authorized supervisors to review therapist work</li>
                <li>Allow clinics to manage patient care and administration</li>
                <li>Send appointment reminders and service notifications</li>
                <li>Provide technical support</li>
                <li>Protect platform security</li>
                <li>Comply with legal or safety requirements</li>
              </UL>

              <H3>A3. Who Can Access Patient Information</H3>
              <P>Patient data may be accessed only by authorized users, including:</P>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-semibold text-slate-800">Therapist —</span>{" "}
                  <span className="text-slate-600">The therapist selected by the patient or assigned by the clinic may access patient details, appointment history, therapy records, and clinical notes for the purpose of providing therapy services.</span>
                </p>
                <p className="text-sm"><span className="font-semibold text-slate-800">Supervisor —</span>{" "}
                  <span className="text-slate-600">An authorized supervisor may access patient records and therapy notes only where the supervisor is responsible for supervising or reviewing the therapist&apos;s work.</span>
                </p>
                <p className="text-sm"><span className="font-semibold text-slate-800">Clinic —</span>{" "}
                  <span className="text-slate-600">If the patient receives services through a clinic, authorized clinic personnel may access patient information only for care management, appointment management, recordkeeping, billing, or supervision purposes.</span>
                </p>
              </div>

              <H3>A4. Patient Data Is Not Shared for Marketing</H3>
              <P>TheraKonnect does not share patient therapy records, clinical notes, or mental health information with advertisers, marketers, data brokers, or unrelated third parties.</P>

              <H3>A5. Patient Rights</H3>
              <P>Patients may request:</P>
              <UL>
                <li>Access to their personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Account closure</li>
                <li>Deletion of certain personal information</li>
                <li>Restriction of non-essential communication</li>
                <li>Information about how their data is used</li>
              </UL>
              <P>Some records may not be deleted immediately if they are required for therapy records, legal compliance, clinic obligations, dispute resolution, safety, or professional recordkeeping.</P>
            </section>

            {/* B. Therapist Privacy Policy */}
            <section className="space-y-3">
              <H2 id="therapist-policy">B. Therapist Privacy Policy</H2>

              <H3>B1. Information Collected from Therapists</H3>
              <P>TheraKonnect may collect:</P>
              <UL>
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Profile photo</li>
                <li>Qualifications</li>
                <li>Professional experience</li>
                <li>Specialties</li>
                <li>License, certification, or verification details, where applicable</li>
                <li>Clinic affiliation</li>
                <li>Availability schedule</li>
                <li>Appointment history</li>
                <li>Patient records created by the therapist</li>
                <li>Therapy notes and session notes</li>
                <li>Supervisor comments or review history</li>
                <li>Payment or payout details, where applicable</li>
                <li>Login activity and platform usage</li>
              </UL>

              <H3>B2. How Therapist Information Is Used</H3>
              <UL>
                <li>Create and manage therapist accounts</li>
                <li>Verify therapist identity and qualifications</li>
                <li>Display therapist profiles to patients</li>
                <li>Manage appointment availability</li>
                <li>Connect therapists with patients</li>
                <li>Support clinic and supervision workflows</li>
                <li>Maintain therapy records and notes</li>
                <li>Process payments or payouts, where applicable</li>
                <li>Handle complaints, disputes, or quality concerns</li>
                <li>Protect platform security</li>
              </UL>

              <H3>B3. Therapist Profile Visibility</H3>
              <P>Some therapist information may be visible to patients or clinics, including:</P>
              <UL>
                <li>Name</li>
                <li>Profile photo</li>
                <li>Qualifications</li>
                <li>Specialties</li>
                <li>Experience</li>
                <li>Availability</li>
                <li>Consultation mode</li>
                <li>Fee information, where applicable</li>
              </UL>
              <P>Therapists are responsible for ensuring their profile information is accurate, professional, and not misleading.</P>

              <H3>B4. Therapist Responsibility for Patient Data</H3>
              <P>Therapists must protect patient confidentiality. Therapists must not:</P>
              <UL>
                <li>Share patient information without authorization</li>
                <li>Download or copy patient records unnecessarily</li>
                <li>Use patient data for marketing</li>
                <li>Discuss patient cases outside authorized clinical or supervision settings</li>
                <li>Share login credentials</li>
                <li>Allow unauthorized persons to access patient records</li>
                <li>Record sessions without proper consent</li>
                <li>Use patient information for personal or unrelated purposes</li>
              </UL>
            </section>

            {/* C. Supervisor Privacy Policy */}
            <section className="space-y-3">
              <H2 id="supervisor-policy">C. Supervisor Privacy Policy</H2>

              <H3>C1. Information Collected from Supervisors</H3>
              <UL>
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Qualifications</li>
                <li>Professional experience</li>
                <li>Clinic affiliation</li>
                <li>Assigned therapists</li>
                <li>Supervision notes</li>
                <li>Case review comments</li>
                <li>Login activity</li>
                <li>Platform usage history</li>
              </UL>

              <H3>C2. How Supervisor Information Is Used</H3>
              <UL>
                <li>Create and manage supervisor accounts</li>
                <li>Assign therapists for supervision</li>
                <li>Review therapist work</li>
                <li>Support clinical quality and professional oversight</li>
                <li>Maintain supervision records</li>
                <li>Monitor platform compliance</li>
                <li>Support clinic administration</li>
              </UL>

              <H3>C3. Supervisor Access to Patient Records</H3>
              <P>Supervisors may access patient records only where:</P>
              <UL>
                <li>The therapist is assigned to the supervisor</li>
                <li>The clinic or platform has authorized the supervision relationship</li>
                <li>Access is required for reviewing therapy work, case notes, clinical quality, or professional guidance</li>
              </UL>
              <P>Supervisors must not access unrelated patient records.</P>

              <H3>C4. Supervisor Confidentiality Duties</H3>
              <P>Supervisors must keep patient, therapist, and clinic information confidential. Supervisors must not:</P>
              <UL>
                <li>Share patient records externally</li>
                <li>Use patient information for teaching, research, publication, or marketing without proper authorization</li>
                <li>Access records outside their assigned supervision role</li>
                <li>Copy, export, or disclose therapy notes without permission</li>
                <li>Use patient information for personal purposes</li>
              </UL>
            </section>

            {/* E. Super Admin Privacy Policy */}
            <section className="space-y-3">
              <H2 id="superadmin-policy">E. Super Admin Privacy Policy</H2>

              <H3>E1. Information Collected from Super Admins</H3>
              <UL>
                <li>Full name</li>
                <li>Work email</li>
                <li>Role and permission level</li>
                <li>Login activity</li>
                <li>Administrative actions</li>
                <li>Support activity</li>
                <li>Security and audit logs</li>
              </UL>

              <H3>E2. Super Admin Access</H3>
              <P>Super Admins may have elevated platform access. However, access to patient data must be limited to authorized purposes only. Super Admins may access data only for:</P>
              <UL>
                <li>Technical troubleshooting</li>
                <li>Platform support</li>
                <li>Security monitoring</li>
                <li>Account management</li>
                <li>Audit and compliance</li>
                <li>Investigation of misuse</li>
                <li>Legal or safety requirements</li>
              </UL>

              <H3>E3. Super Admin Restrictions</H3>
              <P>Super Admins must not:</P>
              <UL>
                <li>View patient records without a valid reason</li>
                <li>Use patient data for personal purposes</li>
                <li>Export data without authorization</li>
                <li>Share access credentials</li>
                <li>Modify records without permission</li>
                <li>Disclose patient, therapist, clinic, or platform information</li>
                <li>Access records outside assigned duties</li>
              </UL>
              <P>Super Admin actions may be logged, monitored, and audited.</P>
            </section>

            {/* 4. General use */}
            <section className="space-y-3">
              <H2 id="general-use">4. How We Use Information Generally</H2>
              <P>TheraKonnect may use collected information to:</P>
              <UL>
                <li>Provide the platform</li>
                <li>Create and manage accounts</li>
                <li>Verify users</li>
                <li>Manage appointments</li>
                <li>Maintain therapy records</li>
                <li>Support therapist-supervisor workflows</li>
                <li>Support clinic management</li>
                <li>Send appointment reminders</li>
                <li>Provide customer support</li>
                <li>Improve platform functionality</li>
                <li>Prevent fraud or misuse</li>
                <li>Protect user accounts</li>
                <li>Maintain security logs</li>
                <li>Comply with legal obligations</li>
              </UL>
            </section>

            {/* 5. Sharing */}
            <section className="space-y-3">
              <H2 id="sharing">5. Sharing and Disclosure of Data</H2>
              <P><span className="font-semibold text-slate-800">TheraKonnect does not sell, rent, trade, or commercially share patient data.</span></P>
              <P>Patient data, therapy records, session notes, and clinical notes are accessible only to authorized users who require access for the purpose of providing, managing, supervising, or supporting therapy services within the TheraKonnect platform.</P>
              <P>TheraKonnect may allow access to patient information only in the following limited circumstances:</P>

              <H3>5.1 Therapist Access</H3>
              <P>Patient data may be accessed by the therapist selected by the patient or assigned by the clinic for the purpose of providing therapy services, managing appointments, maintaining clinical notes, and supporting continuity of care.</P>

              <H3>5.2 Supervisor Access</H3>
              <P>Patient records and therapy notes may be accessed by an authorized supervisor only where the supervisor is responsible for reviewing, guiding, monitoring, or supervising the therapist&apos;s clinical work. Supervisor access is limited to the patient records connected to the therapist or clinic under supervision.</P>

              <H3>5.3 Clinic Access</H3>
              <P>Where the patient receives services through a clinic, authorized clinic personnel may access patient information only for legitimate clinical, administrative, appointment-management, supervision, billing, or recordkeeping purposes. Clinic staff must not access, use, copy, export, or disclose patient information unless required for their assigned role.</P>

              <H3>5.4 Platform Administrative Access</H3>
              <P>TheraKonnect&apos;s authorized technical or administrative personnel may access patient data only when necessary for platform operation, troubleshooting, security, account support, audit, or legal compliance. Administrative access is restricted, monitored, and limited to authorized purposes.</P>

              <H3>5.5 Legal Requirement or Safety Concern</H3>
              <P>TheraKonnect, therapists, supervisors, or clinics may disclose limited patient information only where required by applicable law, court order, regulatory authority, or where disclosure is necessary to prevent serious harm, protect life, respond to abuse, or address an immediate safety risk.</P>

              <H3>5.6 No Third-Party Sharing for Marketing</H3>
              <P>TheraKonnect does not share patient data, therapy notes, clinical records, or mental health information with advertisers, marketers, data brokers, or unrelated third parties.</P>

              <H3>5.7 Service Providers</H3>
              <P>TheraKonnect may use secure technology service providers such as hosting, storage, security, or system infrastructure providers only to operate and maintain the platform. Such providers are not permitted to use patient data for their own purposes, marketing, profiling, resale, or unrelated processing.</P>
            </section>

            {/* 6. Security */}
            <section className="space-y-3">
              <H2 id="security">6. Data Security</H2>
              <P>TheraKonnect uses reasonable technical and organizational measures to protect user data. These may include:</P>
              <UL>
                <li>Role-based access control</li>
                <li>Password protection</li>
                <li>Secure login systems</li>
                <li>Limited user permissions</li>
                <li>Activity logs</li>
                <li>Admin access monitoring</li>
                <li>Data backup systems</li>
                <li>Secure hosting infrastructure</li>
                <li>Security reviews and internal controls</li>
              </UL>
              <P>Users are responsible for keeping their login credentials private and secure. TheraKonnect is not responsible for unauthorized access caused by user negligence, shared passwords, weak passwords, compromised devices, or failure to log out from shared devices.</P>
            </section>

            {/* 7. Retention */}
            <section className="space-y-3">
              <H2 id="retention">7. Data Retention</H2>
              <P>TheraKonnect retains personal data only as long as necessary for:</P>
              <UL>
                <li>Providing platform services</li>
                <li>Maintaining patient therapy records</li>
                <li>Appointment history</li>
                <li>Clinic administration</li>
                <li>Supervision records</li>
                <li>Payment or billing records</li>
                <li>Legal compliance</li>
                <li>Safety or dispute resolution</li>
                <li>Security and audit logs</li>
              </UL>
              <P>Therapy notes and patient records may need to be retained even after account closure where required for professional, legal, clinic, safety, or recordkeeping purposes.</P>
            </section>

            {/* 8. Deletion */}
            <section className="space-y-3">
              <H2 id="deletion">8. Account Closure and Data Deletion</H2>
              <P>Users may request account closure or deletion of certain personal information by contacting:</P>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Email:</span>{" "}
                <a href="mailto:contact@therakonnect.com" className="text-[#4b7eff] underline-offset-2 hover:underline">contact@therakonnect.com</a>
              </p>
              <P>TheraKonnect may not be able to delete all information immediately where retention is required for:</P>
              <UL>
                <li>Therapy recordkeeping</li>
                <li>Clinic records</li>
                <li>Legal obligations</li>
                <li>Payment records</li>
                <li>Dispute resolution</li>
                <li>Fraud prevention</li>
                <li>Safety concerns</li>
                <li>Security logs</li>
                <li>Compliance purposes</li>
              </UL>
              <P>Where deletion is not possible, TheraKonnect may restrict, archive, or limit access to the information.</P>
            </section>

            {/* 9. Confidentiality */}
            <section className="space-y-3">
              <H2 id="confidentiality">9. Confidentiality</H2>
              <P>All therapists, supervisors, clinics, clinic staff, and Super Admins must maintain confidentiality of patient information. Patient information must not be disclosed except as allowed under this Privacy Policy, applicable law, professional obligations, clinic policy, or patient consent.</P>
              <P>Unauthorized access, use, copying, export, or disclosure of patient information may result in account suspension, termination, legal action, or reporting to relevant authorities.</P>
            </section>

            {/* 10. Minors */}
            <section className="space-y-3">
              <H2 id="minors">10. Children and Minors</H2>
              <P>TheraKonnect may allow services for minors only where appropriate consent is provided by a parent, guardian, or legally authorized representative, unless applicable law allows otherwise.</P>
              <P>Therapists and clinics are responsible for ensuring proper consent and safeguarding procedures when providing services to minors.</P>
            </section>

            {/* 11. Cookies */}
            <section className="space-y-3">
              <H2 id="cookies">11. Cookies and Technical Data</H2>
              <P>TheraKonnect may use cookies or similar technologies to:</P>
              <UL>
                <li>Keep users logged in</li>
                <li>Remember preferences</li>
                <li>Improve platform performance</li>
                <li>Monitor security</li>
                <li>Detect misuse</li>
                <li>Understand platform usage</li>
              </UL>
              <P>Users may disable cookies through browser settings, but some platform features may not work properly.</P>
            </section>

            {/* 12. Communications */}
            <section className="space-y-3">
              <H2 id="communications">12. Communications</H2>
              <P>TheraKonnect may send users:</P>
              <UL>
                <li>Account notifications</li>
                <li>Appointment reminders</li>
                <li>Security alerts</li>
                <li>Platform updates</li>
                <li>Payment or billing notices</li>
                <li>Support messages</li>
                <li>Policy updates</li>
              </UL>
              <P>TheraKonnect may also send non-essential communication where permitted. Users may opt out of non-essential communication.</P>
            </section>

            {/* 13. Accuracy */}
            <section className="space-y-3">
              <H2 id="accuracy">13. Data Accuracy</H2>
              <P>Users are responsible for providing accurate and updated information. Therapists, supervisors, and clinics are responsible for ensuring that records, notes, profiles, and professional details entered by them are accurate, appropriate, and lawful.</P>
            </section>

            {/* 14. International */}
            <section className="space-y-3">
              <H2 id="international">14. International Hosting or Storage</H2>
              <P>TheraKonnect may use cloud hosting, storage, or technical infrastructure located inside or outside Pakistan. Where data is stored or processed through service infrastructure, TheraKonnect will take reasonable steps to protect the data and restrict access according to this Privacy Policy.</P>
            </section>

            {/* 15. Breach */}
            <section className="space-y-3">
              <H2 id="breach">15. Breach or Security Incident</H2>
              <P>If TheraKonnect becomes aware of a security incident affecting user data, it may take appropriate steps, including:</P>
              <UL>
                <li>Investigating the issue</li>
                <li>Restricting affected access</li>
                <li>Notifying affected users where appropriate</li>
                <li>Taking corrective action</li>
                <li>Cooperating with relevant authorities where required</li>
              </UL>
              <P>Users must immediately report suspected unauthorized access to:{" "}
                <a href="mailto:contact@therakonnect.com" className="font-medium text-[#4b7eff] underline-offset-2 hover:underline">contact@therakonnect.com</a>
              </P>
            </section>

            {/* 16. User Responsibilities */}
            <section className="space-y-3">
              <H2 id="responsibilities">16. User Responsibilities</H2>
              <P>All users must:</P>
              <UL>
                <li>Keep login details confidential</li>
                <li>Use strong passwords</li>
                <li>Not share accounts</li>
                <li>Not access data without authorization</li>
                <li>Not copy, export, or misuse patient records</li>
                <li>Report unauthorized access</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Respect patient confidentiality and privacy</li>
              </UL>
            </section>

            {/* 17. Changes */}
            <section className="space-y-3">
              <H2 id="changes">17. Changes to This Privacy Policy</H2>
              <P>TheraKonnect may update this Privacy Policy from time to time. The updated version will be posted on the website with a new effective date. Continued use of TheraKonnect after changes means acceptance of the updated Privacy Policy.</P>
            </section>

            {/* 18. Contact */}
            <section className="space-y-3">
              <H2 id="contact">18. Contact Us</H2>
              <P>For privacy questions, data requests, account deletion, or complaints, contact:</P>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">TheraKonnect Privacy Team</p>
                <p className="text-sm text-slate-600">
                  Email:{" "}
                  <a href="mailto:contact@therakonnect.com" className="text-[#4b7eff] underline-offset-2 hover:underline">contact@therakonnect.com</a>
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
