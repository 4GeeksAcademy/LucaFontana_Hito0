export type FeatureIcon = "bolt" | "gift" | "heart" | "mail" | "map" | "money" | "phone" | "shield" | "star";

export interface Pillar {
  bullets: string[];
  icon: FeatureIcon;
  title: string;
}

export interface CountryCard {
  cities: string[];
  description: string;
  hours: string;
  title: string;
}

export interface Benefit {
  description: string;
  icon: FeatureIcon;
}

export interface Dish {
  alt: string;
  badge: string;
  badgeClassName: string;
  description: string;
  image: string;
  label: string;
  price: string;
  title: string;
  weight: string;
}

export interface Review {
  initials: string;
  location: string;
  name: string;
  quote: string;
}

export interface ContactCard {
  ariaLabel: string;
  href: string;
  icon: FeatureIcon;
  label: string;
  value: string;
}

export const pillars: Pillar[] = [
  {
    title: "Calidad Consistente",
    icon: "shield",
    bullets: [
      "Mismas recetas y estándares en todos los locales",
      "Ingredientes frescos seleccionados diariamente",
    ],
  },
  {
    title: "Experiencia Cálida",
    icon: "heart",
    bullets: ["Servicio amable y atento", "Ambiente familiar en cada visita"],
  },
  {
    title: "Rapidez",
    icon: "bolt",
    bullets: ["Tu comida lista en minutos", "Sin sacrificar sabor ni calidad"],
  },
];

export const countries: CountryCard[] = [
  {
    title: "Colombia",
    description: "10 restaurantes en Medellín, Bogotá y Cali",
    hours: "Horario: Lun-Dom 11:00 - 22:00",
    cities: ["Medellín", "Bogotá", "Cali"],
  },
  {
    title: "Estados Unidos (Florida)",
    description: "4 restaurantes en Miami y Orlando",
    hours: "Horario: Mon-Sun 11:00 AM - 10:00 PM",
    cities: ["Miami", "Orlando"],
  },
];

export const benefits: Benefit[] = [
  {
    icon: "money",
    description: "Acumula 1 punto por cada $10.000 COP o $5 USD",
  },
  {
    icon: "gift",
    description: "Canjea tus puntos por descuentos y platos gratis",
  },
  {
    icon: "star",
    description: "Ofertas exclusivas para miembros",
  },
  {
    icon: "phone",
    description: "Registro 100% digital - ¡ya no más tarjetas de papel!",
  },
];

export const dishes: Dish[] = [
  {
    title: "Costillas Ahumadas al Carbón",
    description:
      "Costillas de cerdo ahumadas durante 6 horas con nuestra mezcla secreta de especias y glaseadas con salsa BBQ artesanal.",
    price: "$45.000 COP",
    weight: "450g",
    image: "/images/brasaland-history.jpg",
    alt: "Costillas ahumadas al carbón con salsa barbacoa",
    badge: "Popular",
    badgeClassName: "bg-brand text-white",
    label: "Costillas Ahumadas al Carbón",
  },
  {
    title: "Pechuga Brasaland Especial",
    description:
      "Pechuga de pollo marinada en hierbas frescas, asada a la brasa y acompañada de vegetales de temporada.",
    price: "$32.000 COP",
    weight: "350g",
    image: "/images/brasaland-chicken.jpg",
    alt: "Pechuga de pollo a la brasa con vegetales asados",
    badge: "Saludable",
    badgeClassName: "bg-green-600 text-white",
    label: "Pechuga Brasaland Especial",
  },
  {
    title: "Chorizo Criollo a la Brasa",
    description:
      "Chorizo artesanal preparado con receta tradicional colombiana, servido con arepa de maíz y guacamole fresco.",
    price: "$28.000 COP",
    weight: "300g",
    image: "/images/brasaland-hero.jpg",
    alt: "Chorizo criollo a la brasa con arepa y guacamole",
    badge: "Clásico",
    badgeClassName: "bg-amber-600 text-white",
    label: "Chorizo Criollo a la Brasa",
  },
  {
    title: "Lomo de Res Premium",
    description:
      "Corte premium de lomo fino, sellado a alta temperatura y bañado en chimichurri casero con papas al romero.",
    price: "$58.000 COP",
    weight: "400g",
    image: "/images/brasaland-beef.jpg",
    alt: "Lomo de res premium a la brasa con chimichurri",
    badge: "Premium",
    badgeClassName: "bg-brand text-white",
    label: "Lomo de Res Premium",
  },
];

export const reviews: Review[] = [
  {
    name: "Carolina M.",
    location: "Medellín, Colombia",
    initials: "CM",
    quote:
      "Las costillas ahumadas son increíbles. Llevo viniendo cada semana desde que abrieron en El Poblado. ¡El mejor restaurante de brasa de Medellín!",
  },
  {
    name: "James R.",
    location: "Miami, Florida",
    initials: "JR",
    quote:
      "I moved to Miami from New York and this place reminds me of the best BBQ spots back home, but with an amazing Colombian twist. The lomo is out of this world!",
  },
  {
    name: "Andrés P.",
    location: "Bogotá, Colombia",
    initials: "AP",
    quote:
      "Celebramos el cumpleaños de mi esposa aquí y el servicio fue espectacular. El chorizo criollo y las costillas... ¡para repetir sin dudarlo!",
  },
  {
    name: "María L.",
    location: "Cali, Colombia",
    initials: "ML",
    quote:
      "Soy vegetariana y aún así disfruto venir con mi familia. Tienen opciones de vegetales a la brasa que son deliciosas. El ambiente es súper acogedor.",
  },
];

export const contactCards: ContactCard[] = [
  {
    icon: "mail",
    label: "Email",
    value: "hola@brasaland.com",
    href: "mailto:hola@brasaland.com",
    ariaLabel: "Enviar email a hola@brasaland.com",
  },
  {
    icon: "phone",
    label: "Colombia",
    value: "+57 4 123 4567",
    href: "tel:+5741234567",
    ariaLabel: "Llamar a Colombia: +57 4 123 4567",
  },
  {
    icon: "phone",
    label: "Florida",
    value: "+1 305 123 4567",
    href: "tel:+13051234567",
    ariaLabel: "Llamar a Florida: +1 305 123 4567",
  },
];