import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="logo footer-logo">
            <span className="logo-mark">T</span>
            <span className="logo-text">TheraKonnect</span>
          </div>
          <p className="footer-text">
            TheraKonnect is a digital platform connecting patients with verified
            therapists across Pakistan. Book appointments and access quality
            mental healthcare with ease.
          </p>
        </div>

        <div>
          <h4 className="footer-title">For patients</h4>
          <ul className="footer-list" style={{ display: "flex", flexDirection: "column" }}>
            <li>
              <Link href="/appointments/find-therapist">Find a therapist</Link>
            </li>
            <li>
              <Link href="/appointments/book">Book appointment</Link>
            </li>
            <li>
              <Link href="/appointments/my">My appointments</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">For therapists</h4>
          <ul className="footer-list" style={{ display: "flex", flexDirection: "column" }}>
            <li>
              <Link href="/register/staff">Join as therapist</Link>
            </li>
            <li>
              <Link href="/availability">Manage availability</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">Company</h4>
          <ul className="footer-list" style={{ display: "flex", flexDirection: "column" }}>
            <li>
              <Link href="/about">About us</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms and conditions</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} TheraKonnect. All rights reserved.</span>
          <span>Built for better mental healthcare access.</span>
        </div>
      </div>
    </footer>
  );
}
