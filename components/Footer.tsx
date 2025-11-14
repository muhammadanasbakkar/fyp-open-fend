import Link from "next/link";

export default function Footer() {
  return (
     <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="logo footer-logo">
              <span className="logo-mark">H</span>
              <span className="logo-text">TheraKonnect.com</span>
            </div>
            <p className="footer-text">
              TheraKonnect.com is a digital platform that connects patients with verified doctors across Pakistan. 
              Book appointments online and access quality health care more easily.
            </p>
          </div>

          <div>
            <h4 className="footer-title">For patients</h4>
            <ul className="footer-list">
              <li>Find a therapist</li>
              <li>Video consult</li>
              {/* <li>Lab tests</li> */}
              {/* <li>Help center</li> */}
            </ul>
          </div>

          <div>
            <h4 className="footer-title">For doctors</h4>
            <ul className="footer-list">
              <Link href="/register/staff">Join as therapist</Link>
              {/* <li>Therapist app</li> */}
              <Link href="/register/staff">Clinic software</Link>
            </ul>
          </div>

    <div>
      <h4 className="footer-title" >Company</h4>
      <ul className="footer-list" style={{ display: 'flex', flexDirection: 'column' }}>
        <Link href="/about">About us</Link>
        {/* <li>Careers</li> */}
        <Link href="/privacy">Privacy policy</Link>
        <Link href="/terms">Terms and conditions</Link>
      </ul>
    </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <span>© {new Date().getFullYear()} TheraKonnect.com. All rights reserved.</span>
            <span>Made for demo. Replace with your own branding.</span>
          </div>
        </div>
      </footer>
  );
}
