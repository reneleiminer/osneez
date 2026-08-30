"use client";

import { useEffect } from "react";

import type { CategorySlug } from "@/types/shop";

/** Placeholder measurements — replace with the factory spec sheet per style. */
const TABLES: Record<string, { head: string[]; rows: string[][] }> = {
  apparel: {
    head: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
    rows: [
      ["XS", "104", "66", "60"],
      ["S", "110", "68", "61"],
      ["M", "116", "70", "62"],
      ["L", "122", "72", "63"],
      ["XL", "128", "74", "64"],
      ["XXL", "134", "76", "65"],
    ],
  },
  bottoms: {
    head: ["Size", "Waist (cm)", "Inseam (cm)", "Leg opening (cm)"],
    rows: [
      ["S", "72–78", "74", "16"],
      ["M", "78–84", "76", "17"],
      ["L", "84–92", "78", "18"],
      ["XL", "92–100", "80", "19"],
    ],
  },
  accessories: {
    head: ["Size", "Circumference (cm)"],
    rows: [["One size", "54–61, adjustable"]],
  },
};

function tableFor(category: CategorySlug) {
  if (category === "bottoms") return TABLES.bottoms;
  if (category === "accessories") return TABLES.accessories;
  return TABLES.apparel;
}

export function SizeGuide({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category: CategorySlug;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const table = tableFor(category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Größentabelle"
      className="fixed inset-0 z-[85] flex items-end justify-center bg-void/85 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-lg border os-rule bg-ink p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="os-eyebrow">Size guide</p>
            <p className="os-display mt-1 text-2xl">Measurements</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="os-label text-[0.625rem] text-smoke transition-colors hover:text-bone"
          >
            Close
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-max text-left text-xs">
            <thead>
              <tr className="border-b os-rule">
                {table.head.map((cell) => (
                  <th
                    key={cell}
                    scope="col"
                    className="os-label py-3 pr-6 text-[0.5625rem] font-semibold text-smoke"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]} className="border-b border-bone/5">
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      className="py-3 pr-6 tabular-nums"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[0.6875rem] leading-relaxed text-smoke">
          Platzhalterwerte. Vor dem Launch mit den finalen Maßtabellen aus der
          Produktion ersetzen. Alle Angaben als Produktmaße, flach gemessen,
          Toleranz ±2 cm.
        </p>
      </div>
    </div>
  );
}
