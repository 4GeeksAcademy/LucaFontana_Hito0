import Image from "next/image";

import { BrasaPointsCTA } from "@/components/home/BrasaPointsCTA";
import { FadeIn } from "@/components/FadeIn";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  benefits,
  contactCards,
  countries,
  dishes,
  pillars,
  reviews,
  type ContactCard,
  type FeatureIcon,
} from "@/lib/site-data";

const homeNavigation = [
  { href: "#hero", label: "Inicio", current: true },
  { href: "#ubicaciones", label: "Ubicaciones" },
  { href: "#platos", label: "Platos" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#brasa-points", label: "Brasa Points" },
  { href: "#contacto", label: "Contacto" },
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Brasaland",
  description: "Cadena de restaurantes de comida a la brasa en Colombia y Estados Unidos",
  url: "https://brasaland.com",
  foundingDate: "2008",
  servesCuisine: "Grilled food, Colombian cuisine",
  priceRange: "$$",
  address: [
    {
      "@type": "PostalAddress",
      addressCountry: "CO",
      addressLocality: "Medellín",
      addressRegion: "Antioquia",
    },
    {
      "@type": "PostalAddress",
      addressCountry: "US",
      addressLocality: "Miami",
      addressRegion: "FL",
    },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+57-4-123-4567",
    contactType: "customer service",
    availableLanguage: ["Spanish", "English"],
  },
  sameAs: ["https://instagram.com/brasaland", "https://facebook.com/brasaland"],
};

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function renderFeatureIcon(icon: FeatureIcon) {
  switch (icon) {
    case "shield":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      );
    case "heart":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
    case "bolt":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />;
    case "map":
      return (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      );
    case "money":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
    case "gift":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
    case "star":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />;
    case "mail":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
    case "phone":
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />;
  }
}

function FeatureIcon({ icon }: { icon: FeatureIcon }) {
  return (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {renderFeatureIcon(icon)}
    </svg>
  );
}

function StarRating() {
  return (
    <div className="mb-4 flex items-center gap-1" role="img" aria-label="Calificación: 5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} className="h-5 w-5 text-brand" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ContactIcon({ icon }: Pick<ContactCard, "icon">) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {renderFeatureIcon(icon)}
      </svg>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <SiteHeader logoHref="/" logoAriaLabel="Brasaland - Inicio" navItems={homeNavigation} enableScrollShadow />

      <main role="main">
        <section
          id="hero"
          className="relative flex min-h-screen items-center justify-center overflow-hidden"
          aria-label="Sección principal de Brasaland"
        >
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src="/images/brasaland-hero.jpg"
              alt="Plato de carne a la brasa con acompañamientos frescos"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-dark" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 pt-20 text-center sm:px-6">
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              El sabor de la brasa, <span className="text-brand">en cada bocado</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-300 sm:text-xl md:text-2xl">
              Desde 2008 sirviendo las mejores carnes a la brasa en Colombia y Estados Unidos. 14 ubicaciones, una misma pasión por la calidad y el sabor.
            </p>
            <div className="mt-10">
              <BrasaPointsCTA
                variant="hero"
                ariaLabel="Registrarse en el programa Brasa Points"
              />
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
            <ArrowDownIcon />
          </div>
        </section>

        <section id="historia" className="bg-dark py-20 md:py-32" aria-labelledby="historia-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <FadeIn className="order-2 lg:order-1">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-brand/10">
                  <Image
                    src="/images/brasaland-history.jpg"
                    alt="Plato típico de Brasaland con carne, papas y aderezos"
                    width={800}
                    height={600}
                    className="h-72 w-full object-cover md:h-96"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent" />
                </div>
              </FadeIn>

              <FadeIn className="order-1 lg:order-2">
                <span className="text-brand text-sm font-semibold uppercase tracking-widest">Desde 2008</span>
                <h2 id="historia-title" className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                  Nuestra Historia
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-gray-300">
                  Fundada en Medellín en 2008, Brasaland comenzó como un sueño familiar: compartir el auténtico sabor de la carne a la brasa con calidad constante y servicio cálido. Hoy somos 14 restaurantes en dos países, pero mantenemos la misma receta de éxito: productos frescos, técnicas tradicionales, y pasión por cada plato que servimos.
                </p>
                <div className="mt-8 flex items-center gap-6">
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-brand">14</span>
                    <span className="text-sm text-gray-400">Ubicaciones</span>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-brand">2</span>
                    <span className="text-sm text-gray-400">Países</span>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-brand">115+</span>
                    <span className="text-sm text-gray-400">Empleados</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section id="unicos" className="bg-dark-surface py-20 md:py-32" aria-labelledby="unicos-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading eyebrow="Nuestros pilares" id="unicos-title" title="Lo que nos hace únicos" />
            </FadeIn>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {pillars.map((pillar, index) => (
                <FadeIn
                  key={pillar.title}
                  as="article"
                  className="group relative rounded-2xl border border-white/5 bg-dark-card p-8 transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                  style={{ transitionDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                    <FeatureIcon icon={pillar.icon} />
                  </div>
                  <h3 className="mb-3 font-display text-xl font-bold">{pillar.title}</h3>
                  <ul className="space-y-2 text-gray-400">
                    {pillar.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <CheckIcon />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="ubicaciones" className="bg-dark py-20 md:py-32" aria-labelledby="ubicaciones-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading eyebrow="Dónde estamos" id="ubicaciones-title" title="Nuestras Ubicaciones" />
            </FadeIn>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
              {countries.map((country, index) => (
                <FadeIn
                  key={country.title}
                  as="article"
                  className="relative overflow-hidden rounded-2xl border border-white/5 bg-dark-card p-8 transition-all duration-300 hover:border-brand/20"
                  style={{ transitionDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5" aria-hidden="true" />
                  <div className="relative">
                    <div className="mb-6 flex items-center gap-3">
                      <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {renderFeatureIcon("map")}
                      </svg>
                      <h3 className="font-display text-2xl font-bold">{country.title}</h3>
                    </div>
                    <p className="mb-4 text-lg text-gray-300">{country.description}</p>
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{country.hours}</span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {country.cities.map((city) => (
                        <span key={city} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section
          id="brasa-points"
          className="relative overflow-hidden bg-gradient-to-br from-dark-surface via-dark to-dark-surface py-20 md:py-32"
          aria-labelledby="brasa-points-title"
        >
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl" aria-hidden="true" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading eyebrow="Programa de fidelización" id="brasa-points-title" title="Gana puntos con cada visita" />
            </FadeIn>

            <FadeIn className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.description}
                  className="rounded-2xl border border-white/10 bg-dark-card/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-brand/30"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <FeatureIcon icon={benefit.icon} />
                  </div>
                  <p className="text-sm text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </FadeIn>

            <FadeIn className="mt-12 text-center">
              <BrasaPointsCTA
                variant="section"
                ariaLabel="Registrarse ahora en Brasa Points"
              />
            </FadeIn>

            <FadeIn className="mt-12 text-center">
              <div className="inline-block max-w-2xl rounded-xl border border-white/10 bg-white/5 px-6 py-4">
                <p className="text-sm text-gray-300">
                  ¿Quieres hacer un pedido? Llama a tu ubicación favorita o visítanos directamente. ¡Pronto tendremos pedidos en línea!
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="platos" className="bg-dark py-20 md:py-32" aria-labelledby="platos-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading
                eyebrow="Nuestros favoritos"
                id="platos-title"
                title="Platos Frecuentes"
                description="Los platos más pedidos por nuestros clientes, preparados con la técnica y el sabor que nos caracterizan."
              />
            </FadeIn>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {dishes.map((dish, index) => (
                <FadeIn
                  key={dish.title}
                  as="article"
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-dark-card transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                  style={{ transitionDelay: `${0.1 * (index + 1)}s` }}
                  aria-label={dish.label}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={dish.image}
                      alt={dish.alt}
                      width={600}
                      height={480}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold ${dish.badgeClassName}`}>
                      {dish.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold transition-colors duration-300 group-hover:text-brand">
                      {dish.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">{dish.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-brand">{dish.price}</span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-500">{dish.weight}</span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="resenas" className="bg-dark-surface py-20 md:py-32" aria-labelledby="resenas-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading eyebrow="Opiniones reales" id="resenas-title" title="Lo que dicen nuestros clientes" />
            </FadeIn>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {reviews.map((review, index) => (
                <FadeIn
                  key={review.name}
                  as="article"
                  className="group rounded-2xl border border-white/5 bg-dark-card p-6 transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                  style={{ transitionDelay: `${0.1 * (index + 1)}s` }}
                  aria-label={`Reseña de ${review.name}`}
                >
                  <StarRating />
                  <blockquote className="mb-4 text-sm leading-relaxed text-gray-300">"{review.quote}"</blockquote>
                  <footer className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand" aria-hidden="true">
                      {review.initials}
                    </div>
                    <div>
                      <cite className="text-sm font-semibold not-italic text-white">{review.name}</cite>
                      <p className="text-xs text-gray-500">{review.location}</p>
                    </div>
                  </footer>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="bg-dark-surface py-20 md:py-32" aria-labelledby="contacto-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading eyebrow="Hablemos" id="contacto-title" title="Contacto" />
            </FadeIn>

            <FadeIn className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
              {contactCards.map((card) => (
                <div
                  key={card.label}
                  className="flex flex-col items-center rounded-2xl border border-white/5 bg-dark-card p-6 text-center transition-all duration-300 hover:border-brand/20"
                >
                  <ContactIcon icon={card.icon} />
                  <h3 className="mb-1 font-semibold text-white">{card.label}</h3>
                  <a
                    href={card.href}
                    className="rounded text-gray-400 transition-colors hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
                    aria-label={card.ariaLabel}
                  >
                    {card.value}
                  </a>
                </div>
              ))}
            </FadeIn>
          </div>
        </section>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </>
  );
}