import type { ReportBucket } from "@/lib/admin/data";

/**
 * Inline SVG bar chart — no charting library, no client JavaScript.
 * `format` renders the tooltip value; bars scale to the largest bucket.
 */
export function BarChart({
  data,
  format,
  height = 160,
  label,
}: {
  data: ReportBucket[];
  format: (value: number) => string;
  height?: number;
  label: string;
}) {
  if (!data.length) {
    return <p className="text-xs text-smoke">Noch keine Daten.</p>;
  }

  const max = Math.max(...data.map((entry) => entry.value), 1);
  const width = 100;
  const gap = data.length > 40 ? 0.2 : 0.6;
  const barWidth = width / data.length - gap;

  return (
    <figure className="grid gap-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        className="h-40 w-full"
      >
        {data.map((entry, index) => {
          const barHeight = (entry.value / max) * (height - 8);
          return (
            <rect
              key={entry.label}
              x={index * (width / data.length)}
              y={height - barHeight}
              width={barWidth}
              height={barHeight || 0.6}
              className={entry.value > 0 ? "fill-signal" : "fill-steel"}
            >
              <title>{`${entry.label}: ${format(entry.value)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="os-label flex justify-between text-[0.5625rem] text-smoke">
        <span>{data[0]?.label}</span>
        <span>Max {format(max)}</span>
        <span>{data[data.length - 1]?.label}</span>
      </figcaption>
    </figure>
  );
}
