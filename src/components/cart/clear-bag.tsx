"use client";

import { useEffect } from "react";

import { clearLines } from "@/lib/shop/bag-store";

/** Empties the local bag once an order is confirmed. */
export function ClearBag() {
  useEffect(() => {
    clearLines();
  }, []);

  return null;
}
