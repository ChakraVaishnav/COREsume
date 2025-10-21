import { Geist, Geist_Mono, Merriweather } from "next/font/google";
import "./globals.css";
import { Inter } from 'next/font/google';
import Head from "next/head";

const inter = Inter({ subsets: ['latin'] });
const merri = Merriweather({ subsets: ['latin'], weight: ['400','700'], display: 'swap', variable: '--font-merri' });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "COREsume – Free Resume Builder, make ATS Friendly Resumes get hired in 2025",
  description:
    "Create stylish, professional resumes effortlessly with COREsume – the modern resume builder for students and professionals.",
  keywords: [
    "resume builder",
    "resume generator",
    "core resume",
    "modern resume",
    "free resume builder",
    "online CV",
    "ATS resume",
    "student resume",
    "professional resume",
    "download resume",
    "resume templates",
    "AI resume",
    "resume tips"
  ],
  icons: {
    icon: "/CoresumeLogo.png",
    shortcut: "/CoresumeLogo.png",
    apple: "/CoresumeLogo.png",
  },
  verification: {
    google: "jka4DRBGLCNJ_bMO3bCsvIu1JzP7aLQoiF_-cUn7-lE",
    other: {
      "msvalidate.01": "85023E8EB0DCAE5FAB481C687E63C677",
    },
  },
  openGraph: {
    title: "COREsume – Build Stylish Resumes",
    description: "Build and download beautiful resumes in minutes using COREsume!",
    url: "https://coresume.in/",
    siteName: "COREsume",
    images: [
      {
        url: "https://coresume.in/CoresumeLogo.png",
        width: 800,
        height: 800,
        alt: "COREsume Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COREsume – Build Stylish Resumes",
    description: "Create stylish, professional resumes effortlessly with COREsume.",
    images: ["https://coresume.in/CoresumeLogo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="COREsume Team" />
        <meta name="theme-color" content="#FFD600" />
        <link rel="canonical" href="https://coresume.in/" />
        {/* Merriweather loaded via next/font for consistent loading across app */}
        {/* Social meta tags for sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.images[0]} />
        <meta name="google-adsense-account" content="ca-pub-6429806131272523"></meta>
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}