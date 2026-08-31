import type { ReactNode } from "react";

export function AdminHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b os-rule pb-5">
      <div>
        <h1 className="os-display text-[clamp(2rem,5vw,3.25rem)] leading-[0.85]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[60ch] text-xs leading-relaxed text-smoke">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border os-rule bg-asphalt/40 p-5 ${className}`}>
      {title ? <p className="os-eyebrow mb-5">{title}</p> : null}
      {children}
    </section>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required = false,
  hint,
  className = "",
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  step?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="os-eyebrow block">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="os-input"
      />
      {hint ? <p className="mt-1 text-[0.625rem] text-smoke">{hint}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  className?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="os-eyebrow block">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        className="os-input resize-y"
      />
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  className = "",
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  className?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="os-eyebrow block">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? undefined}
        className="os-input bg-ink"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked = false,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <label htmlFor={id} className="os-label flex items-center gap-3 text-[0.6875rem]">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 accent-signal"
      />
      {label}
    </label>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: ReactNode;
}) {
  const border =
    tone === "error"
      ? "border-signal"
      : tone === "success"
        ? "border-bone"
        : "border-steel";
  return (
    <div className={`border-l-2 ${border} bg-asphalt/60 px-4 py-3`}>
      <p className="text-xs leading-relaxed text-smoke">{children}</p>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="border os-rule px-6 py-14 text-center">
      <p className="text-sm text-smoke">{children}</p>
    </div>
  );
}
