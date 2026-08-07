import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="success-page">
      <p className="eyebrow">PAYMENT RECEIVED</p>
      <h1>Danke für<br />deine Order.</h1>
      <p>Deine Bestätigung und Rechnung kommen per E-Mail. Wir geben dir Bescheid, sobald dein Paket unterwegs ist.</p>
      <Link className="button" href="/">Zurück zum Shop <span>→</span></Link>
    </main>
  );
}
