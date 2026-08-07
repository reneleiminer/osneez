"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/catalog";

type BagLine = { id: string; size: string; quantity: number };

export default function Home() {
  const [bag, setBag] = useState<BagLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const count = bag.reduce((sum, line) => sum + line.quantity, 0);
  const total = useMemo(
    () => bag.reduce((sum, line) => sum + (products.find((p) => p.id === line.id)?.price ?? 0) * line.quantity, 0),
    [bag],
  );

  function add(id: string, size: string) {
    setBag((current) => {
      const item = current.find((line) => line.id === id && line.size === size);
      return item ? current.map((line) => line === item ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { id, size, quantity: 1 }];
    });
    setOpen(true);
  }

  async function checkout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: bag }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Checkout konnte nicht gestartet werden.");
      window.location.assign(data.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Etwas ist schiefgelaufen.");
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="announcement">FREE SHIPPING IN DE AB 120 € · DROP 01 IST LIVE</div>
      <nav className="nav"><a className="logo" href="#top">OSNEEZ</a><div className="navlinks"><a href="#shop">Shop</a><a href="#story">Story</a><a href="#contact">Kontakt</a></div><button className="bag-button" onClick={() => setOpen(true)}>Bag <span>{count}</span></button></nav>
      <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">DROP 01 / 2026</p><h1>MOVE<br />DIFFERENT.</h1><p>Streetwear für Nächte, die zu kurz sind, und Tage, die dir gehören.</p><a className="button" href="#shop">Jetzt entdecken <span>→</span></a></div><div className="hero-art"><div className="orb orb-one" /><div className="orb orb-two" /><p>OS<br />NEEZ</p></div></section>
      <section id="shop" className="shop"><div className="section-heading"><div><p className="eyebrow">THE FIRST RUN</p><h2>Essentials, elevated.</h2></div><span>{products.length} PIECES</span></div><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={add} />)}</div></section>
      <section id="story" className="manifesto"><p className="eyebrow">OSNEEZ WORLDWIDE</p><h2>Not made to fit in.<br /><i>Made to be felt.</i></h2><p>OSNEEZ ist unabhängige Streetwear. Reduziert im Look, kompromisslos in der Haltung. Kleine Runs, hochwertige Stoffe, keine Massenware.</p></section>
      <footer id="contact"><div className="logo">OSNEEZ</div><div><p>NEWSLETTER</p><form onSubmit={(e) => e.preventDefault()}><input aria-label="E-Mail-Adresse" placeholder="E-MAIL-ADRESSE" type="email" /><button>→</button></form></div><small>© 2026 OSNEEZ · IMPRESSUM · DATENSCHUTZ</small></footer>
      {open && <aside className="drawer" aria-label="Warenkorb"><button className="close" onClick={() => setOpen(false)}>×</button><p className="eyebrow">YOUR BAG</p><h2>{count ? `${count} Artikel` : "Deine Bag ist leer."}</h2><div className="bag-lines">{bag.map((line) => { const product = products.find((p) => p.id === line.id)!; return <div className="bag-line" key={`${line.id}-${line.size}`}><div className={`mini ${product.tone}`} /><div><b>{product.name}</b><small>{line.size} · {line.quantity}×</small></div><span>{(product.price * line.quantity).toFixed(2).replace(".", ",")} €</span></div> })}</div>{count > 0 && <><div className="total"><span>Gesamt</span><b>{total.toFixed(2).replace(".", ",")} €</b></div><button className="checkout" onClick={checkout} disabled={loading}>{loading ? "Wird geladen …" : "Sicher bezahlen →"}</button><small>Versand und Steuern werden im Checkout berechnet.</small></>}</aside>}
    </main>
  );
}

function ProductCard({ product, onAdd }: { product: (typeof products)[number]; onAdd: (id: string, size: string) => void }) {
  const [size, setSize] = useState<string>(product.sizes[0]);
  return <article className="product"><div className={`product-image ${product.tone}`}><span>{product.badge}</span><div className="product-mark">OS<br />NEEZ</div></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.price.toFixed(2).replace(".", ",")} €</p></div><div className="sizes">{product.sizes.map((option) => <button className={option === size ? "selected" : ""} onClick={() => setSize(option)} key={option}>{option}</button>)}</div><button className="add" onClick={() => onAdd(product.id, size)}>In die Bag <span>+</span></button></div></article>;
}
