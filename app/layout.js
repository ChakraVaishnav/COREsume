import { Merriweather, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-resume-serif",
  display: "swap",
});

// metadataBase is critical — without this, relative OG image URLs break
export const metadata = {
  metadataBase: new URL("https://coresume.in"),

  title: {
    default: "COREsume – Free AI Resume Builder for Students | ATS Friendly",
    template: "%s | COREsume",
  },

  description:
    "Build ATS-friendly resumes in minutes with COREsume. Free AI-powered resume builder with 9+ templates, ATS scores, and job matching — built for students and freshers.",

  keywords: [
    "free resume builder india",
    "ATS friendly resume builder",
    "resume builder for students",
    "AI resume builder",
    "resume templates for freshers",
    "online resume maker",
    "resume builder 2025",
    "coresume",
    "resume ATS score checker",
    "resume for placement",
    "resume for internship india",
    "job resume builder free",
  ],

  authors: [{ name: "COREsume", url: "https://coresume.in" }],
  creator: "COREsume",
  publisher: "COREsume",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://coresume.in/",
  },

  icons: {
    icon: "/CoresumeLogo.png",
    shortcut: "/CoresumeLogo.png",
    apple: "/CoresumeLogo.png",
  },

  // App Router handles verification natively
  verification: {
    google: "qjWlWPTlrL3EOPdsu8WmhFJ1tviL9GGsJpN-oH3fsRI",
    other: {
      "msvalidate.01": "85023E8EB0DCAE5FAB481C687E63C677",
    },
  },

  openGraph: {
    title: "COREsume – Free AI Resume Builder for Students",
    description:
      "Build ATS-friendly resumes in minutes. AI-powered suggestions, 9+ templates, ATS scores — free for students.",
    url: "https://coresume.in/",
    siteName: "COREsume",
    images: [
      {
        // Replace this with a real 1200x630 OG preview image — not just your logo
        // A screenshot of the product or a designed banner works way better for shares
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "COREsume – AI Resume Builder for Students",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "COREsume – Free AI Resume Builder",
    description:
      "Build ATS-friendly resumes in minutes. AI-powered, free for students.",
    images: ["/og-image.png"],
    creator: "@coresume", // add your handle when you create one
  },
};

// Fetch real aggregate rating from DB, cached for 1 hour
const getAggregateRating = unstable_cache(
  async () => {
    const result = await prisma.rating.aggregate({
      _avg: { score: true },
      _count: true,
    });
    return result;
  },
  ["aggregate-rating"],
  { revalidate: 3600 }
);

export default async function RootLayout({ children }) {
  // Build JSON-LD structured data — helps Google understand what COREsume is
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "COREsume",
    url: "https://coresume.in",
    description:
      "Free AI-powered resume builder for students and freshers. Build ATS-friendly resumes with 9+ templates.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  // Inject real aggregate rating from DB (cached for 1 hour)
  try {
    const rating = await getAggregateRating();
    if (rating._count > 0 && rating._avg.score !== null) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: rating._avg.score.toFixed(1),
        reviewCount: String(rating._count),
      };
    }
  } catch {
    // If DB is unavailable, omit aggregateRating rather than showing fake data
  }

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FFD600" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} ${merriweather.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}