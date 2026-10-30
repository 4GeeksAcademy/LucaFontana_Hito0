import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { AppHeader } from "@/components/proveedores/AppHeader";
import { SharedAuthGuard } from "@shared/auth/AuthGuard";
import { AuthProvider } from "@/components/proveedores/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Directorio de proveedores | Brasaland Digital",
  description: "Backoffice para registrar, filtrar y actualizar proveedores de Brasaland Digital.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>
          <AppHeader />
          <SharedAuthGuard>{children}</SharedAuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
