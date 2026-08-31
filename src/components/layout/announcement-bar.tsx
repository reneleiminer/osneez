/**
 * Slow vertical ticker. Pure CSS, no JS, no layout shift.
 * Lines come from the company settings.
 */
export function AnnouncementBar({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  const sequence = [...lines, lines[0]];

  return (
    <div className="relative z-50 h-9 overflow-hidden border-b os-rule bg-void">
      <div className="os-edge flex h-full items-center justify-center">
        <div className="h-3 overflow-hidden">
          <div
            className="animate-[ticker_13s_linear_infinite]"
            style={{ animationDuration: `${Math.max(8, lines.length * 4.5)}s` }}
          >
            {sequence.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="os-label flex h-3 items-center justify-center text-[0.5625rem] whitespace-nowrap text-smoke"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
