import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { SharedAuthGuard } from "@shared/auth/AuthGuard";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Centro de incidentes | Brasaland Digital",
  description: "Gestión centralizada de incidentes operativos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalNavbar />
        <SharedAuthGuard>{children}</SharedAuthGuard>
      </body>
    </html>
  );
}
