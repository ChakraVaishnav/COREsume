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
  title: "COREsume",
  icons: {
    icon: "/CoresumeLogo.png",
    shortcut: "/CoresumeLogo.png",
    apple: "/CoresumeLogo.png",
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
