import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Brasaland Backoffice",
  description: "Backoffice de Brasaland para análisis operativo de incidencias.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0a0a] text-white">
        <div className="relative flex min-h-full flex-col">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.12),transparent_22%),linear-gradient(180deg,rgba(10,10,10,0.95),rgba(10,10,10,1))]" />
          <div className="relative flex min-h-full flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
