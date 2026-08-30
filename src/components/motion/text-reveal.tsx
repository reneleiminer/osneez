"use client";

import { Reveal } from "./reveal";

type TextRevealProps = {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** Delay between lines in ms. */
  stagger?: number;
  baseDelay?: number;
};

/**
 * Line-by-line clip-path reveal for editorial headlines. Each line sits in its
 * own overflow-hidden box so the mask reads as type sliding out of the page.
 */
export function TextReveal({
  lines,
  className = "",
  lineClassName = "",
  as = "h2",
  stagger = 110,
  baseDelay = 0,
}: TextRevealProps) {
  const Tag = as;

  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden">
          <Reveal
            as="span"
            variant="mask"
            delay={baseDelay + index * stagger}
            className={`block ${lineClassName}`}
          >
            {line}
          </Reveal>
        </span>
      ))}
    </Tag>
  );
}
