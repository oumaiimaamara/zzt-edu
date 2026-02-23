import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kido Paradise",
  description: "Kido Paradise — Cours & contenus éducatifs pour les parents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          fe-bg
          fe-text
          min-h-screen
        `}
      >
        <Providers>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
