import type { ReactNode } from "react";

export function SectionHeading({
  index,
  eyebrow,
  children,
  action,
  className = "",
}: {
  index?: string;
  eyebrow?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-6 border-b os-rule pb-5 ${className}`}
    >
      <div className="flex items-baseline gap-4">
        {index ? <span className="os-eyebrow text-signal">{index}</span> : null}
        {eyebrow ? <span className="os-eyebrow">{eyebrow}</span> : null}
      </div>
      {children}
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}
