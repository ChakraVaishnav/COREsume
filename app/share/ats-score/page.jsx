import { redirect } from "next/navigation";

// Resolve tier description from score (must match the OG image logic)
function getTierDesc(score) {
  if (score >= 90) return "Elite ATS Score — Top Tier Resume";
  if (score >= 75) return "Strong ATS Score — Above Average";
  if (score >= 60) return "Decent Score — Small Fixes Needed";
  return "Needs Work — COREsume Can Fix This";
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const score = Math.min(100, Math.max(0, parseInt(params?.score || "0")));
  const tierDesc = getTierDesc(score);

  const ogImageUrl = `https://coresume.in/api/og/ats-score?score=${score}`;
  const title = `I scored ${score}/100 on the ATS Resume Checker — COREsume`;
  const description = `${tierDesc}. COREsume scans your resume against ATS algorithms so you never get filtered out before a human sees it. Check yours for free!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://coresume.in/share/ats-score?score=${score}`,
      siteName: "COREsume",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `ATS Score ${score}/100 — ${tierDesc}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      site: "@coresume_in",
    },
  };
}

// This page redirects to the ATS tool — it exists purely for OG tag crawling.
export default async function AtsShareLandingPage({ searchParams }) {
  const params = await searchParams;
  const score = params?.score || "0";
  // After social crawlers read the OG tags, real users get redirected to the tool.
  redirect(`/dashboard/ats-score`);
}
