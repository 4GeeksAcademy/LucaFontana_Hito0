"use client";

import { useEffect, useState } from "react";

import { SiteNavigationLinks, type SiteNavigationItem } from "@/components/SiteNavigationLinks";

interface SiteHeaderProps {
  enableScrollShadow?: boolean;
  logoAriaLabel: string;
  logoHref: string;
  navItems: SiteNavigationItem[];
}

function MenuOpenIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      className={`h-6 w-6${hidden ? " hidden" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function MenuCloseIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      className={`h-6 w-6${hidden ? " hidden" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function SiteHeader({
  enableScrollShadow = false,
  logoAriaLabel,
  logoHref,
  navItems,
}: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isElevated, setIsElevated] = useState(false);

  useEffect(() => {
    if (!enableScrollShadow) {
      return undefined;
    }

    const handleScroll = () => {
      setIsElevated(window.pageYOffset > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableScrollShadow]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-xl transition-all duration-300${
        isElevated ? " shadow-lg shadow-black/20" : ""
      }`}
      role="banner"
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8"
        aria-label="Navegación principal"
      >
        <a
          href={logoHref}
          className="rounded-lg font-display text-2xl font-extrabold tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-950 md:text-3xl"
          aria-label={logoAriaLabel}
        >
          Brasa<span className="text-brand">land</span>
        </a>

        <SiteNavigationLinks variant="desktop" items={navItems} />

        <button
          type="button"
          className="rounded-lg p-2 text-gray-300 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-brand md:hidden"
          aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
        >
          <MenuOpenIcon hidden={isMenuOpen} />
          <MenuCloseIcon hidden={!isMenuOpen} />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`border-t border-white/5 bg-gray-950/98 backdrop-blur-xl md:hidden${isMenuOpen ? " block" : " hidden"}`}
        role="menu"
        aria-label="Menú de navegación móvil"
      >
        <SiteNavigationLinks
          variant="mobile"
          items={navItems}
          onNavigate={closeMenu}
        />
      </div>
    </header>
  );
}