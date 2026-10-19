import type { Metadata } from "next";

import { BrasaPointsApplication } from "@/components/brasa-points/BrasaPointsApplication";

export const metadata: Metadata = {
  title: "Brasa Points — Registro",
  description:
    "Únete al programa de fidelización Brasa Points de Brasaland. Acumula puntos con cada visita y canjea por descuentos y platos gratis.",
  alternates: {
    canonical: "/brasa-points",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Brasa Points — Registro | Brasaland",
    description:
      "Únete al programa de fidelización Brasa Points. Acumula puntos con cada visita y canjea por descuentos y platos gratis.",
    type: "website",
    url: "/brasa-points",
    locale: "es_CO",
    images: [
      {
        url: "/images/brasaland-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Plato de carne a la brasa con acompañamientos frescos",
      },
    ],
  },
};

export default function BrasaPointsPage() {
  return <BrasaPointsApplication />;
}