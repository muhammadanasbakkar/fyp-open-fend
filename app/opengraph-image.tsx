import { ImageResponse } from "next/og";

export const alt = "TheraKonnect – Book Verified Therapists in Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0d1526 0%, #111827 60%, #1a1035 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle background circles */}
        <div style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(26,86,219,0.08)",
        }} />
        <div style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.08)",
        }} />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "linear-gradient(135deg, #1a56db, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 800,
            color: "white",
          }}>
            T
          </div>
          <span style={{
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-1.5px",
          }}>
            TheraKonnect
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 24,
          color: "rgba(156,163,175,1)",
          margin: 0,
          textAlign: "center",
          maxWidth: 680,
          lineHeight: 1.4,
        }}>
          Book verified therapists in Pakistan — online or in-clinic
        </p>

        {/* Gradient divider */}
        <div style={{
          width: 100,
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(to right, #1a56db, #7c3aed)",
        }} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
          {["25,000+ Therapists", "70+ Cities", "4.9 ★ Rating"].map(stat => (
            <div
              key={stat}
              style={{
                padding: "10px 20px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 17,
                color: "rgba(255,255,255,0.82)",
                fontWeight: 600,
              }}
            >
              {stat}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
