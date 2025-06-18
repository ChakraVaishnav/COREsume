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
  title: "Resumint",
  icons: {
    icon: "/ResumintLogo.png",
    shortcut: "/ResumintLogo.png",
    apple: "/ResumintLogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  suppressHydrationWarning
>

        {children}
      </body>
    </html>
  );
}
