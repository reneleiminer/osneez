import { BarChart } from "@/components/admin/bar-chart";
import { AdminHeading, Card, Empty } from "@/components/admin/ui";
import { reportData } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { requireSection } from "@/lib/supabase/auth";

const RANGES = [30, 90, 365];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireSection("reports");
  const { days } = await searchParams;
  const range = RANGES.includes(Number(days)) ? Number(days) : 30;
  const report = await reportData(range);

  const tiles = [
    { label: "Umsatz", value: formatPrice(report.revenueTotal) },
    { label: "Bestellungen", value: String(report.orderCount) },
    { label: "Ø Bestellwert", value: formatPrice(report.averageOrder) },
    {
      label: "Newsletter gesamt",
      value: String(
        report.newsletterByMonth.reduce((sum, entry) => sum + entry.value, 0),
      ),
    },
  ];

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Reports"
        subtitle={`Bezahlte und versendete Bestellungen der letzten ${range} Tage.`}
        action={
          <div className="flex gap-4">
            {RANGES.map((value) => (
              <a
                key={value}
                href={`/admin/reports?days=${value}`}
                data-active={value === range}
                className="os-label text-[0.625rem] text-smoke transition-colors hover:text-bone data-[active=true]:text-signal"
              >
                {value} Tage
              </a>
            ))}
          </div>
        }
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label} className="border os-rule bg-asphalt/40 p-5">
            <p className="os-eyebrow">{tile.label}</p>
            <p className="os-display mt-3 text-3xl">{tile.value}</p>
          </li>
        ))}
      </ul>

      <Card title="Umsatz pro Tag">
        <BarChart
          data={report.days}
          format={(value) => formatPrice(value)}
          label={`Umsatz pro Tag, letzte ${range} Tage`}
        />
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Bestseller">
          {report.topProducts.length === 0 ? (
            <Empty>Noch keine bezahlten Bestellungen.</Empty>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b os-rule">
                  {["Produkt", "Stück", "Umsatz"].map((head) => (
                    <th
                      key={head}
                      scope="col"
                      className="os-label py-2 text-[0.5625rem] text-smoke"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.topProducts.map((product) => (
                  <tr key={product.name} className="border-b border-bone/5">
                    <td className="py-3 pr-4">{product.name}</td>
                    <td className="py-3 pr-4 tabular-nums text-smoke">
                      {product.quantity}
                    </td>
                    <td className="py-3 tabular-nums">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Bestellstatus">
          {report.statuses.length === 0 ? (
            <Empty>Keine Bestellungen im Zeitraum.</Empty>
          ) : (
            <ul className="grid gap-3">
              {report.statuses.map((entry) => (
                <li
                  key={entry.status}
                  className="flex items-baseline justify-between border-b border-bone/5 pb-2"
                >
                  <span className="os-label text-[0.625rem] text-smoke">
                    {entry.status}
                  </span>
                  <span className="tabular-nums">{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Newsletter pro Monat">
          <BarChart
            data={report.newsletterByMonth}
            format={(value) => `${value} Anmeldungen`}
            label="Newsletter-Anmeldungen pro Monat"
          />
        </Card>

        <Card title="Niedriger Bestand">
          {report.lowStock.length === 0 ? (
            <Empty>Alle Größen ausreichend bevorratet.</Empty>
          ) : (
            <ul className="grid gap-2">
              {report.lowStock.map((entry) => (
                <li
                  key={`${entry.product}-${entry.size}`}
                  className="flex items-baseline justify-between border-b border-bone/5 pb-2 text-xs"
                >
                  <span>
                    {entry.product}{" "}
                    <span className="text-smoke">· {entry.size}</span>
                  </span>
                  <span
                    className={`tabular-nums ${entry.stock === 0 ? "text-signal" : "text-smoke"}`}
                  >
                    {entry.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
