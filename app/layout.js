import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "COREsume – Build Your Resume in Core Style",
  description:
    "Create stylish, professional resumes effortlessly with COREsume – the modern resume builder for students and professionals.",
  keywords: [
    "resume builder",
    "resume generator",
    "core resume",
    "modern resume",
    "free resume builder",
    "online CV",
  ],
  icons: {
    icon: "/CoresumeLogo.png",
    shortcut: "/CoresumeLogo.png",
    apple: "/CoresumeLogo.png",
  },
  verification: {
    google: "jka4DRBGLCNJ_bMO3bCsvIu1JzP7aLQoiF_-cUn7-lE", 
  },
  openGraph: {
    title: "COREsume – Build Stylish Resumes",
    description: "Build and download beautiful resumes in minutes using COREsume!",
    url: "https://coresume.vercel.app",
    siteName: "COREsume",
    images: [
      {
        url: "https://coresume.vercel.app/CoresumeLogo.png",
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
    images: ["https://coresume.vercel.app/CoresumeLogo.png"],
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  suppressHydrationWarning
>
<link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {children}
      </body>
    </html>
  );
}
