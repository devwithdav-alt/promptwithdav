"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCfg, useCart } from "./Providers";
import { MODELS, CATS } from "@/lib/defaults";
import { safe } from "@/lib/util";
import Icon from "./Icon";
export const Logo = ({ c = "h-9" }) => { const cfg = useCfg(); return <img src={safe(cfg.logo)} alt={`${cfg.brand} logo`} className={`${c} w-auto`} />; };
export function Preloader() {
  const cfg = useCfg(), [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 700); return () => clearTimeout(t); }, []);
  return (<div id="pre" className={done ? "done" : ""}><div className="text-center"><img src={safe(cfg.logo)} alt="" className="h-20 mx-auto animate-pulse" /><p className="font-black mt-3 text-xl">{cfg.brand}</p>
    <div className="w-40 h-1 bg-neutral-200 rounded mx-auto mt-4 overflow-hidden"><i className="block h-full w-1/2 bg-crim" style={{ animation: "ld 1s ease-in-out infinite" }} /></div></div></div>);
}
export function Bg() {
  const { bg } = useCfg();
  return <div id="bg" aria-hidden="true" style={{ display: bg.on ? "" : "none" }}><i style={{ backgroundImage: bg.img ? `url('${safe(bg.img)}')` : "none", "--o": bg.o / 100 }} /></div>;
}
export function Progress() {
  const [w, setW] = useState(0);
  useEffect(() => { const f = () => { const h = document.documentElement; setW((h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100); }; addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);
  return <div className="fixed top-0 left-0 h-1 bg-crim z-50" style={{ width: w + "%" }} />;
}
export function Header() {
  const cfg = useCfg(), { count } = useCart(), path = usePathname(), act = (h) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-black text-xl hover:text-crim transition-colors"><Logo /><span>{cfg.brand}</span></Link>
        <nav className="hidden md:flex gap-8 font-bold">{cfg.nav.map(([t, h]) => <Link key={h} href={safe(h) || "/"} className={`hover:text-crim transition ${act(h) ? "text-crim" : ""}`}>{t}</Link>)}</nav>
        <div className="flex items-center gap-3">
          <Link href="/checkout" aria-label="Cart" className="relative p-2 hover:text-crim transition"><Icon n="cart" c="w-6 h-6" /><span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-crim text-white text-xs font-bold grid place-items-center">{count}</span></Link>
          <Link href="/shop" className="slide hidden sm:block bg-crim text-white font-bold px-5 py-2.5 rounded-full">{cfg.cta}</Link>
        </div>
      </div>
      <nav className="md:hidden flex justify-around border-t border-neutral-100 py-2 text-sm font-bold">{cfg.nav.map(([t, h]) => <Link key={h} href={safe(h) || "/"} className={act(h) ? "text-crim" : ""}>{t}</Link>)}</nav>
      <div className="bg-ink text-white overflow-hidden py-2 text-sm"><div className="mq fast">{[0, 1].map((k) => <span key={k} className="pr-16 whitespace-nowrap">{(cfg.ticker + " • ").repeat(3)}</span>)}</div></div>
    </div>
  );
}
export function Footer() {
  const cfg = useCfg();
  const L = (arr, k) => arr.map((x) => <li key={x}><Link className="text-white/70 hover:text-crim transition" href={`/shop?${k}=${encodeURIComponent(x)}`}>{x}</Link></li>);
  return (
    <footer className="bg-ink text-white mt-24"><div className="max-w-7xl mx-auto px-4 pt-14 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div><div className="flex items-center gap-2 font-black text-xl bg-white text-ink rounded-xl px-3 py-2 w-fit"><Logo c="h-8" />{cfg.brand}</div>
          <p className="mt-4 text-white/70">{cfg.location}</p><a className="text-white/70 hover:text-crim block" href={`mailto:${cfg.email}`}>{cfg.email}</a>
          <div className="flex gap-3 mt-4">{Object.entries(cfg.social).map(([i, u]) => safe(u) && <a key={i} href={safe(u)} aria-label={i} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-crim transition"><Icon n={i} /></a>)}</div></div>
        <div><h4 className="font-bold mb-4">AI Models</h4><ul className="space-y-2">{L(MODELS.map((m) => m[0]), "m")}</ul></div>
        <div><h4 className="font-bold mb-4">Categories</h4><ul className="space-y-2">{L(CATS.map((c) => c[0]), "c")}</ul></div>
        <div><h4 className="font-bold mb-4">Our Policy</h4><ul className="space-y-2">{[["About", "/about"], ["Contact", "/contact"], ["Help", "/contact#help"], ["Refund Policy", "/contact#refund"]].map(([t, h]) => <li key={t}><Link className="text-white/70 hover:text-crim transition" href={h}>{t}</Link></li>)}</ul></div>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-2 border-t border-white/10 mt-12 pt-6 text-sm text-white/60"><p>{cfg.copy}</p><p>{cfg.by}</p></div>
    </div></footer>
  );
}
