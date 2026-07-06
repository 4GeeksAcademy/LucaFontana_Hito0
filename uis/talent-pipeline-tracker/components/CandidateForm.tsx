"use client";

import { useId, useState } from "react";
import { AsyncNotice } from "@/components/AsyncNotice";
import type { AsyncState, CandidateFormValues } from "@/types";

type SubmitResult = {
  success: boolean;
  error?: string;
};

type CandidateFormProps = {
  idPrefix: string;
  initialValues?: Partial<CandidateFormValues>;
  submitLabel: string;
  state: AsyncState;
  onSubmit: (values: CandidateFormValues) => Promise<SubmitResult>;
  resetOnSuccess?: boolean;
};

const EMPTY_VALUES: CandidateFormValues = {
  full_name: "",
  email: "",
  phone: "",
  position: "",
  linkedin_url: "",
  cv_url: "",
  experience_years: 0,
};

export function CandidateForm({
  idPrefix,
  initialValues,
  submitLabel,
  state,
  onSubmit,
  resetOnSuccess = false,
}: CandidateFormProps) {
  const uniqueId = useId();
  const [values, setValues] = useState<CandidateFormValues>(() => toFormValues(initialValues));
  const [errors, setErrors] = useState<Partial<Record<keyof CandidateFormValues, string>>>({});

  const setField = <Key extends keyof CandidateFormValues>(field: Key, value: CandidateFormValues[Key]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const result = await onSubmit({
      ...values,
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      position: values.position.trim(),
      linkedin_url: values.linkedin_url.trim(),
      cv_url: values.cv_url.trim(),
    });

    if (result.success && resetOnSuccess) {
      setValues(EMPTY_VALUES);
      setErrors({});
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} aria-labelledby={`${idPrefix}-${uniqueId}-title`}>
      <h3 id={`${idPrefix}-${uniqueId}-title`} className="sr-only">
        {submitLabel}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`${idPrefix}-${uniqueId}-full-name`}
          label="Nombre completo"
          value={values.full_name}
          required
          error={errors.full_name}
          onChange={(value) => setField("full_name", value)}
        />
        <Field
          id={`${idPrefix}-${uniqueId}-position`}
          label="Posición"
          value={values.position}
          required
          error={errors.position}
          onChange={(value) => setField("position", value)}
        />
        <Field
          id={`${idPrefix}-${uniqueId}-email`}
          label="Email"
          type="email"
          value={values.email}
          required
          error={errors.email}
          onChange={(value) => setField("email", value)}
        />
        <Field
          id={`${idPrefix}-${uniqueId}-phone`}
          label="Teléfono"
          type="tel"
          value={values.phone}
          required
          error={errors.phone}
          onChange={(value) => setField("phone", value)}
        />
        <Field
          id={`${idPrefix}-${uniqueId}-experience`}
          label="Años de experiencia"
          type="number"
          min={0}
          step="0.5"
          value={String(values.experience_years)}
          required
          error={errors.experience_years}
          onChange={(value) => setField("experience_years", Number(value))}
        />
        <Field
          id={`${idPrefix}-${uniqueId}-linkedin`}
          label="LinkedIn"
          type="url"
          value={values.linkedin_url}
          error={errors.linkedin_url}
          onChange={(value) => setField("linkedin_url", value)}
        />
      </div>

      <Field
        id={`${idPrefix}-${uniqueId}-cv`}
        label="URL del CV"
        type="url"
        value={values.cv_url}
        error={errors.cv_url}
        onChange={(value) => setField("cv_url", value)}
      />

      <AsyncNotice state={state} />

      <button
        type="submit"
        disabled={state.status === "loading"}
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.status === "loading" ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  min,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url" | "number";
  min?: number;
  step?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-300" htmlFor={id}>
      <span className="font-medium text-zinc-100">
        {label}
        {required ? <span className="ml-1 text-[var(--color-brand-light)]">*</span> : null}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={min}
        step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="h-11 rounded-2xl border border-white/10 bg-[var(--color-dark-surface)] px-4 text-sm text-white outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/30"
      />
      {error ? (
        <span id={describedBy} className="text-sm text-red-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function validate(values: CandidateFormValues) {
  const errors: Partial<Record<keyof CandidateFormValues, string>> = {};

  if (!values.full_name.trim()) {
    errors.full_name = "El nombre completo es obligatorio.";
  }

  if (!values.email.trim()) {
    errors.email = "El email es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Introduce un email válido.";
  }

  if (!values.phone.trim()) {
    errors.phone = "El teléfono es obligatorio.";
  }

  if (!values.position.trim()) {
    errors.position = "La posición es obligatoria.";
  }

  if (!Number.isFinite(values.experience_years) || values.experience_years < 0) {
    errors.experience_years = "La experiencia debe ser un número igual o mayor que 0.";
  }

  if (values.linkedin_url.trim() && !isValidUrl(values.linkedin_url.trim())) {
    errors.linkedin_url = "Introduce una URL de LinkedIn válida.";
  }

  if (values.cv_url.trim() && !isValidUrl(values.cv_url.trim())) {
    errors.cv_url = "Introduce una URL de CV válida.";
  }

  return errors;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toFormValues(initialValues?: Partial<CandidateFormValues>): CandidateFormValues {
  return {
    ...EMPTY_VALUES,
    ...initialValues,
    experience_years: initialValues?.experience_years ?? 0,
    linkedin_url: initialValues?.linkedin_url ?? "",
    cv_url: initialValues?.cv_url ?? "",
  };
}