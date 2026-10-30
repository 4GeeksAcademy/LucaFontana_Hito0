import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Backoffice | Brasaland Digital",
  description: "Acceso centralizado a las aplicaciones de backoffice de Brasaland Digital.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
