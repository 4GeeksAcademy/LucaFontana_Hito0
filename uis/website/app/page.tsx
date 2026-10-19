import type { Metadata } from "next";

import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Brasaland — Restaurantes de Comida a la Brasa | Colombia y Estados Unidos",
  description:
    "Brasaland: cadena de restaurantes de comida a la brasa con 14 ubicaciones en Colombia y Estados Unidos. Desde 2008, calidad, sabor y pasión en cada bocado.",
  keywords: [
    "Brasaland",
    "restaurante",
    "brasa",
    "parrilla",
    "Colombia",
    "Estados Unidos",
    "Medellín",
    "Miami",
    "comida a la brasa",
  ],
  authors: [{ name: "Brasaland" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Brasaland — Restaurantes de Comida a la Brasa",
    description:
      "Desde 2008 sirviendo las mejores carnes a la brasa en Colombia y Estados Unidos. 14 ubicaciones, una misma pasión por la calidad y el sabor.",
    type: "website",
    url: "/",
    locale: "es_CO",
    siteName: "Brasaland",
    images: [
      {
        url: "/images/brasaland-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Plato de carne a la brasa con acompañamientos frescos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brasaland — Restaurantes de Comida a la Brasa",
    description:
      "Desde 2008 sirviendo las mejores carnes a la brasa en Colombia y Estados Unidos.",
    images: ["/images/brasaland-hero.jpg"],
  },
};

export default function Page() {
  return <HomePage />;
}
