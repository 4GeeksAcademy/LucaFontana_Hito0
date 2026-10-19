"use client";

import { useEffect, useMemo, useState } from "react";

import { FadeIn } from "@/components/FadeIn";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type Country = "Colombia" | "Estados Unidos";
type FieldName = "birthdate" | "city" | "country" | "email" | "fullname" | "howFound" | "phone" | "terms";

interface FormState {
  birthdate: string;
  city: string;
  country: string;
  dietary: string[];
  email: string;
  fullname: string;
  howFound: string;
  location: string;
  offers: boolean;
  phone: string;
  terms: boolean;
}

type FormErrors = Partial<Record<FieldName, string>>;
type LocationTree = Record<Country, Record<string, string[]>>;

const applicationNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/#ubicaciones", label: "Ubicaciones" },
  { href: "#", label: "Menú" },
  { href: "/brasa-points", label: "Brasa Points", current: true },
  { href: "/#contacto", label: "Contacto" },
];

const dietaryOptions = ["Sin restricciones", "Vegetariano", "Sin gluten", "Otro"];
const howFoundOptions = [
  "Redes sociales",
  "Recomendación",
  "Pasando por el local",
  "Búsqueda en internet",
  "Otro",
];

const locationTree: LocationTree = {
  Colombia: {
    Medellín: ["El Poblado", "Laureles", "Envigado", "Belén"],
    Bogotá: ["Zona T", "Usaquén", "Chapinero"],
    Cali: ["Granada", "Ciudad Jardín", "San Fernando"],
  },
  "Estados Unidos": {
    Miami: ["Brickell", "Doral"],
    Orlando: ["Lake Buena Vista", "Winter Park"],
  },
};

const initialFormState: FormState = {
  fullname: "",
  email: "",
  phone: "",
  birthdate: "",
  country: "",
  city: "",
  location: "",
  dietary: [],
  howFound: "",
  terms: false,
  offers: false,
};

function SectionLegendIcon({ children }: { children: React.ReactNode }) {
  return <span className="text-brand">{children}</span>;
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm text-red-400" role="alert" aria-live="polite">
      {message}
    </p>
  );
}

function validateForm(formState: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!formState.fullname.trim()) {
    errors.fullname = "Ingresa tu nombre completo.";
  }

  if (!formState.email.trim()) {
    errors.email = "Ingresa tu email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
    errors.email = "Ingresa un email válido.";
  }

  if (!formState.phone.trim()) {
    errors.phone = "Ingresa tu teléfono.";
  } else if (!/^[+\d\s().-]{7,}$/.test(formState.phone)) {
    errors.phone = "Ingresa un teléfono válido.";
  }

  if (!formState.birthdate) {
    errors.birthdate = "Selecciona tu fecha de nacimiento.";
  } else if (new Date(formState.birthdate) > new Date()) {
    errors.birthdate = "La fecha de nacimiento no puede ser futura.";
  }

  if (!formState.country) {
    errors.country = "Selecciona tu país.";
  }

  if (!formState.city) {
    errors.city = "Selecciona tu ciudad.";
  }

  if (!formState.howFound) {
    errors.howFound = "Selecciona cómo nos conociste.";
  }

  if (!formState.terms) {
    errors.terms = "Debes aceptar los términos del programa.";
  }

  return errors;
}

export function BrasaPointsApplication() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const availableCities = useMemo(() => {
    if (!formState.country) {
      return [];
    }

    return Object.keys(locationTree[formState.country as Country]);
  }, [formState.country]);

  const availableLocations = useMemo(() => {
    if (!formState.country || !formState.city) {
      return [];
    }

    return locationTree[formState.country as Country][formState.city] ?? [];
  }, [formState.city, formState.country]);

  useEffect(() => {
    if (!showSuccessModal) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuccessModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [showSuccessModal]);

  const handleInputChange = (name: keyof FormState, value: string | boolean | string[]) => {
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));

    if (name in errors) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }));
    }
  };

  const handleCountryChange = (country: string) => {
    setFormState((currentState) => ({
      ...currentState,
      country,
      city: "",
      location: "",
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      country: undefined,
      city: undefined,
    }));
  };

  const handleCityChange = (city: string) => {
    setFormState((currentState) => ({
      ...currentState,
      city,
      location: "",
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      city: undefined,
    }));
  };

  const handleDietaryToggle = (value: string) => {
    setFormState((currentState) => {
      const dietary = currentState.dietary.includes(value)
        ? currentState.dietary.filter((item) => item !== value)
        : [...currentState.dietary, value];

      return {
        ...currentState,
        dietary,
      };
    });
  };

  const handleClear = () => {
    setFormState(initialFormState);
    setErrors({});
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formState);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setShowSuccessModal(true);
    setFormState(initialFormState);
  };

  return (
    <>
      <SiteHeader logoHref="/" logoAriaLabel="Brasaland - Volver al inicio" navItems={applicationNavigation} />

      <main role="main" className="pt-20 md:pt-24">
        <section className="bg-gradient-to-b from-dark-surface to-dark py-12 md:py-20" aria-labelledby="form-title">
          <FadeIn className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-brand text-sm font-semibold uppercase tracking-widest">Programa de fidelización</span>
            <h1 id="form-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
              Únete a <span className="text-brand">Brasa Points</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Completa el formulario y comienza a acumular puntos con cada visita. Canjea por descuentos y platos gratis en cualquiera de nuestras 14 ubicaciones.
            </p>
          </FadeIn>
        </section>

        <section className="bg-dark pb-20 md:pb-32" aria-label="Formulario de registro Brasa Points">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <form noValidate className="space-y-8" onSubmit={handleSubmit}>
                <fieldset className="space-y-6 rounded-2xl border border-white/5 bg-dark-card p-6 md:p-8">
                  <legend className="flex items-center gap-2 px-2 font-display text-lg font-semibold text-white">
                    <SectionLegendIcon>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </SectionLegendIcon>
                    Información Personal
                  </legend>

                  <div>
                    <label htmlFor="fullname" className="mb-2 block text-sm font-medium text-gray-300">
                      Nombre completo <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <input
                      id="fullname"
                      name="fullname"
                      type="text"
                      autoComplete="name"
                      placeholder="Ej: María García López"
                      value={formState.fullname}
                      onChange={(event) => handleInputChange("fullname", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.fullname)}
                    />
                    <ErrorMessage message={errors.fullname} />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                      Email <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Ej: nombre@correo.com"
                      value={formState.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                    />
                    <ErrorMessage message={errors.email} />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-300">
                      Teléfono <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Ej: +57 300 123 4567"
                      value={formState.phone}
                      onChange={(event) => handleInputChange("phone", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.phone)}
                    />
                    <ErrorMessage message={errors.phone} />
                  </div>

                  <div>
                    <label htmlFor="birthdate" className="mb-2 block text-sm font-medium text-gray-300">
                      Fecha de nacimiento <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={formState.birthdate}
                      onChange={(event) => handleInputChange("birthdate", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 text-white transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.birthdate)}
                    />
                    <ErrorMessage message={errors.birthdate} />
                  </div>
                </fieldset>

                <fieldset className="space-y-6 rounded-2xl border border-white/5 bg-dark-card p-6 md:p-8">
                  <legend className="flex items-center gap-2 px-2 font-display text-lg font-semibold text-white">
                    <SectionLegendIcon>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </SectionLegendIcon>
                    Ubicación
                  </legend>

                  <div>
                    <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-300">
                      País <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formState.country}
                      onChange={(event) => handleCountryChange(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-dark px-4 py-3 text-white transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.country)}
                    >
                      <option value="">Selecciona tu país</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                    </select>
                    <ErrorMessage message={errors.country} />
                  </div>

                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-300">
                      Ciudad <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={formState.city}
                      onChange={(event) => handleCityChange(event.target.value)}
                      disabled={!formState.country}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-dark px-4 py-3 text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.city)}
                    >
                      <option value="">{formState.country ? "Selecciona tu ciudad" : "Primero selecciona un país"}</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ErrorMessage message={errors.city} />
                  </div>

                  <div>
                    <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-300">
                      Ubicación favorita de Brasaland
                    </label>
                    <select
                      id="location"
                      name="location"
                      value={formState.location}
                      onChange={(event) => handleInputChange("location", event.target.value)}
                      disabled={!formState.city}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-dark px-4 py-3 text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                    >
                      <option value="">{formState.city ? "Selecciona tu restaurante favorito" : "Primero selecciona una ciudad"}</option>
                      {availableLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500">Opcional — selecciona tu restaurante favorito</p>
                  </div>
                </fieldset>

                <fieldset className="space-y-6 rounded-2xl border border-white/5 bg-dark-card p-6 md:p-8">
                  <legend className="flex items-center gap-2 px-2 font-display text-lg font-semibold text-white">
                    <SectionLegendIcon>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </SectionLegendIcon>
                    Preferencias
                  </legend>

                  <div>
                    <span className="mb-3 block text-sm font-medium text-gray-300" id="dietary-label">
                      Preferencias alimentarias
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-labelledby="dietary-label">
                      {dietaryOptions.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-dark p-3 transition-colors hover:border-white/20"
                        >
                          <input
                            type="checkbox"
                            checked={formState.dietary.includes(option)}
                            onChange={() => handleDietaryToggle(option)}
                            className="h-5 w-5 rounded border-white/20 bg-dark text-brand focus:ring-brand focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="how-found" className="mb-2 block text-sm font-medium text-gray-300">
                      ¿Cómo nos conociste? <span className="text-brand" aria-label="campo obligatorio">*</span>
                    </label>
                    <select
                      id="how-found"
                      name="how-found"
                      value={formState.howFound}
                      onChange={(event) => handleInputChange("howFound", event.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-dark px-4 py-3 text-white transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-brand focus:outline-none"
                      aria-required="true"
                      aria-invalid={Boolean(errors.howFound)}
                    >
                      <option value="">Selecciona una opción</option>
                      {howFoundOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ErrorMessage message={errors.howFound} />
                  </div>
                </fieldset>

                <fieldset className="space-y-4 rounded-2xl border border-white/5 bg-dark-card p-6 md:p-8">
                  <legend className="flex items-center gap-2 px-2 font-display text-lg font-semibold text-white">
                    <SectionLegendIcon>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </SectionLegendIcon>
                    Términos y comunicaciones
                  </legend>

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-dark p-3 transition-colors hover:border-white/20">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={formState.terms}
                        onChange={(event) => handleInputChange("terms", event.target.checked)}
                        className="mt-0.5 h-5 w-5 rounded border-white/20 bg-dark text-brand focus:ring-brand focus:ring-offset-0"
                        aria-required="true"
                        aria-invalid={Boolean(errors.terms)}
                      />
                      <span className="text-sm text-gray-300">
                        Acepto los términos del programa Brasa Points <span className="text-brand" aria-label="campo obligatorio">*</span>
                      </span>
                    </label>
                    <ErrorMessage message={errors.terms} />
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-dark p-3 transition-colors hover:border-white/20">
                      <input
                        id="offers"
                        name="offers"
                        type="checkbox"
                        checked={formState.offers}
                        onChange={(event) => handleInputChange("offers", event.target.checked)}
                        className="mt-0.5 h-5 w-5 rounded border-white/20 bg-dark text-brand focus:ring-brand focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300">Quiero recibir ofertas por email</span>
                    </label>
                  </div>
                </fieldset>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-brand px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-dark"
                    aria-label="Enviar formulario de registro"
                  >
                    Registrarme en Brasa Points
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-xl border border-white/10 px-8 py-4 font-medium text-gray-300 transition-all duration-200 hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-dark"
                    aria-label="Limpiar todos los campos del formulario"
                  >
                    Limpiar formulario
                  </button>
                </div>
              </form>
            </FadeIn>
          </div>
        </section>
      </main>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Cerrar mensaje de éxito"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-card p-8 shadow-2xl shadow-brand/10 transition-all duration-300 md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
              <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 id="modal-title" className="text-center font-display text-2xl font-bold text-white md:text-3xl">
              ¡Bienvenido a Brasa Points!
            </h2>
            <p className="mt-4 text-center leading-relaxed text-gray-300">
              Tu registro ha sido exitoso. Recibirás un email de confirmación en los próximos minutos con los detalles de tu cuenta y cómo empezar a acumular puntos.
            </p>
            <p className="mt-4 text-center leading-relaxed text-gray-300">
              ¡Ya puedes disfrutar de tus beneficios en cualquiera de nuestras 14 ubicaciones!
            </p>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3 font-semibold text-white shadow-lg shadow-brand/20 transition-all duration-300 hover:bg-brand-dark hover:shadow-brand/30 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-dark-card"
                aria-label="Cerrar mensaje de éxito"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </>
  );
}