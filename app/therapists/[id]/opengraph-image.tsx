import { ImageResponse } from "next/og";

export const alt = "Therapist Profile | TheraKonnect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const CDN = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/+$/, "");

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let name = "Therapist";
  let specializations: string[] = [];
  let exp = "";
  let imageUrl: string | null = null;

  try {
    const res = await fetch(`${API}/api/therapists/therapists/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const t = data.therapist;
      name = t?.name || "Therapist";
      specializations = (t?.specializations || []).slice(0, 2);
      exp = t?.yearsExperience
        ? `${t.yearsExperience} yr${t.yearsExperience !== 1 ? "s" : ""} experience`
        : "Licensed Therapist";
      if (t?.profilePicture) {
        imageUrl = `${CDN}/${t.profilePicture.replace(/^\//, "")}`;
      }
    }
  } catch {
    // Use defaults on error
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0d1526 0%, #111827 60%, #1a1035 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "52px 60px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(26,86,219,0.07)",
        }} />

        {/* Top bar — branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #1a56db, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            color: "white",
          }}>
            T
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
            TheraKonnect
          </span>
        </div>

        {/* Main content — avatar + info */}
        <div style={{ display: "flex", gap: 48, alignItems: "center", flex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: 190,
            height: 190,
            borderRadius: 24,
            background: "linear-gradient(135deg, #1a56db, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 88,
            fontWeight: 800,
            color: "white",
            flexShrink: 0,
            overflow: "hidden",
          }}>
            {imageUrl
              ? <img src={imageUrl} width={190} height={190} style={{ objectFit: "cover" }} />
              : name.charAt(0).toUpperCase()
            }
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Verified badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 100,
              background: "rgba(26,86,219,0.2)",
              border: "1px solid rgba(26,86,219,0.4)",
              width: "fit-content",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />
              <span style={{ fontSize: 13, color: "#93c5fd", fontWeight: 600, letterSpacing: 1 }}>
                VERIFIED THERAPIST
              </span>
            </div>

            {/* Name */}
            <h1 style={{
              fontSize: 54,
              fontWeight: 800,
              color: "white",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-1px",
            }}>
              {name}
            </h1>

            {/* Experience */}
            <p style={{ fontSize: 20, color: "rgba(156,163,175,1)", margin: 0 }}>
              {exp}
            </p>

            {/* Specialization pills */}
            {specializations.length > 0 && (
              <div style={{ display: "flex", gap: 10 }}>
                {specializations.map(s => (
                  <div
                    key={s}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 100,
                      border: "1px solid rgba(99,102,241,0.4)",
                      background: "rgba(99,102,241,0.15)",
                      fontSize: 16,
                      color: "#a5b4fc",
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 16, color: "rgba(156,163,175,0.8)" }}>
            Book this therapist at therakonnect.com
          </span>
          <div style={{
            padding: "10px 22px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #1a56db, #7c3aed)",
            fontSize: 16,
            fontWeight: 700,
            color: "white",
          }}>
            Book a Session →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
