import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const score = Math.min(100, Math.max(0, parseInt(searchParams.get("score") || "0")));
  const tierLabel = searchParams.get("tier") || "";

  // Resolve tier colors from score
  let ringColor = "#ef4444";
  let tierDesc = "Needs Work — COREsume Can Fix This";
  if (score >= 90) { ringColor = "#10b981"; tierDesc = "Elite ATS Score — Top Tier Resume"; }
  else if (score >= 75) { ringColor = "#3b82f6"; tierDesc = "Strong ATS Score — Above Average"; }
  else if (score >= 60) { ringColor = "#f59e0b"; tierDesc = "Decent Score — Small Fixes Needed"; }

  // SVG circle math
  const r = 90;
  const cx = 120;
  const cy = 120;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (score / 100) * circ;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#020617",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow top-left */}
        <div style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "#7c3aed", filter: "blur(100px)", opacity: 0.3,
        }} />
        {/* Glow bottom-right */}
        <div style={{
          position: "absolute", bottom: "-80px", right: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "#eab308", filter: "blur(100px)", opacity: 0.3,
        }} />

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "42px", fontWeight: 900, letterSpacing: "4px", color: "#ffffff", lineHeight: 1 }}>
              COREsume
            </span>
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase" }}>
              AI ATS RESUME OPTIMIZER
            </span>
          </div>
          <div style={{
            padding: "10px 22px", borderRadius: "999px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: "11px", fontWeight: 900, color: "#facc15",
            letterSpacing: "3px", textTransform: "uppercase",
          }}>
            VERIFIED COMPATIBILITY
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", alignItems: "center", gap: "60px", zIndex: 10, flex: 1, margin: "30px 0" }}>

          {/* Score Ring */}
          <div style={{ position: "relative", width: "240px", height: "240px", flexShrink: 0 }}>
            <svg
              width="240" height="240"
              viewBox="0 0 240 240"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f172a" strokeWidth="14" />
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                stroke={ringColor}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "72px", fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-3px" }}>
                {score}
              </span>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", marginTop: "6px" }}>
                ATS RATING
              </span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
            {/* Tier badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 22px", borderRadius: "18px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <span style={{ fontSize: "16px", fontWeight: 900, color: "#ffffff" }}>
                {tierDesc}
              </span>
            </div>

            {/* Checklist panel */}
            <div style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(30,41,59,0.8)",
              borderRadius: "20px",
              padding: "22px 26px",
              display: "flex", flexDirection: "column", gap: "14px",
            }}>
              <span style={{ fontSize: "10px", fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "4px" }}>
                ATS PARSE CHECKS
              </span>
              {[
                "Structural Integrity Verified",
                "Contact Channels Fully Validated",
                "Resume Content Optimized for ATS",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#d1d5db", fontWeight: 600 }}>
                  <span style={{ color: "#10b981", fontWeight: 900, fontSize: "16px" }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "20px",
          zIndex: 10,
          fontSize: "13px", fontWeight: 700, color: "#9ca3af",
        }}>
          <span style={{ letterSpacing: "1px" }}>coresume.in</span>
          <span style={{ color: "#facc15", letterSpacing: "1px" }}>
            Check yours free → coresume.in/dashboard/ats-score
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
