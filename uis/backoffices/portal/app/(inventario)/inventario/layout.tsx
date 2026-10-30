import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SharedAuthGuard } from "@shared/auth/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
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
  title: "Brasaland | Inventario",
  description: "Backoffice de inventario y movimientos de Brasaland.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SharedAuthGuard>{children}</SharedAuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
