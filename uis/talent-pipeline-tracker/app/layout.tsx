import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CandidateProvider } from "@/context/CandidateContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "People & Talent ATS",
  description: "Sistema interno de gestión de pipelines de candidaturas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-dark)] text-zinc-50">
        <CandidateProvider>{children}</CandidateProvider>
      </body>
    </html>
  );
}
