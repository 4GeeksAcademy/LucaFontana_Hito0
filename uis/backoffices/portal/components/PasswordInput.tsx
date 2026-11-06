"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  className: string;
  minLength?: number;
};

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  className,
  minLength,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const visibilityLabel = isVisible ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <span className="relative block w-full">
      <input
        id={id}
        type={isVisible ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${className} w-full pr-12`}
      />
      <button
        type="button"
        title={visibilityLabel}
        aria-label={visibilityLabel}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--brand-soft)]"
      >
        {isVisible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </button>
    </span>
  );
}