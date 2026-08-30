import type { ProductBadge } from "@/types/shop";

const TONE: Record<string, string> = {
  "SOLD OUT": "bg-graphite text-smoke",
  UPCOMING: "bg-graphite text-bone",
  LIMITED: "bg-signal text-paper",
  NEW: "bg-paper text-void",
  RESTOCK: "bg-paper text-void",
};

export function Badge({
  value,
  className = "",
}: {
  value: ProductBadge | string | null;
  className?: string;
}) {
  if (!value) return null;
  const tone = TONE[value] ?? "bg-paper text-void";
  return (
    <span
      className={`os-label inline-flex items-center px-2 py-1 text-[0.5625rem] leading-none ${tone} ${className}`}
    >
      {value}
    </span>
  );
}
