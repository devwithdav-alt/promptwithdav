import Link from "next/link";
import { getCfg, getProducts } from "@/lib/server";
import { MODELS } from "@/lib/defaults";
import { safe } from "@/lib/util";
import ProductCard from "@/components/ProductCard";
import HomeSpy from "@/components/HomeSpy";
import Icon from "@/components/Icon";
export const revalidate = 60;
export default async function Home() {
  const [cfg, all] = await Promise.all([getCfg(), getProducts()]), trending = all.filter((p) => p.trending).slice(0, 8);
  return (<>
    <HomeSpy />
    <section id="s-hero" className="max-w-7xl mx-auto px-4 pt-14 text-center">
      <h1 className="up text-4xl sm:text-6xl font-black leading-tight max-w-4xl mx-auto">{cfg.hero.title}</h1>
      <p className="up mt-5 text-lg text-neutral-600 max-w-2xl mx-auto" style={{ animationDelay: ".12s" }}>{cfg.hero.sub}</p>
      <div className="up mt-8 flex gap-3 justify-center" style={{ animationDelay: ".24s" }}><Link href="/shop" className="slide bg-crim text-white font-bold px-7 py-3.5 rounded-full">{cfg.cta}</Link><Link href="/about" className="font-bold px-7 py-3.5 rounded-full border border-ink hover:bg-ink hover:text-white transition">About the creator</Link></div>
    </section>
    {all.length > 0 && <div className="overflow-hidden mt-12 py-4"><div className="mq">{[0, 1].map((k) => all.map((p) => (
      <Link key={k + "-" + p.id} href={`/product/${p.slug}`} className="mx-2 w-56 shrink-0 rounded-2xl overflow-hidden bg-ink text-white hover:scale-105 transition"><img src={safe(p.images[0])} alt={`${p.title} preview`} className="w-full aspect-square object-cover" /><div className="p-3 text-sm font-bold">{p.model} · {p.cat}</div></Link>)))}</div></div>}
    <section id="s-trend" className="max-w-7xl mx-auto px-4 mt-16"><div className="flex items-end justify-between mb-6"><h2 className="text-3xl font-black">Trending prompts</h2><Link href="/shop" className="font-bold text-crim hover:underline">View all</Link></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">{trending.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      {!trending.length && <p className="text-neutral-500">New prompts are coming soon.</p>}</section>
    <section id="s-power" className="max-w-7xl mx-auto px-4 mt-24"><div className="rounded-3xl bg-ink text-white p-8 sm:p-14 grid md:grid-cols-2 gap-10 items-center"><div>
      <h2 className="text-3xl sm:text-4xl font-black">{cfg.power.title}</h2><p className="mt-4 text-white/70">{cfg.power.text}</p>
      <ul className="mt-6 space-y-3">{cfg.power.points.map((t, i) => <li key={i} className="flex gap-3"><span className="text-crim mt-0.5"><Icon n="check" /></span>{t}</li>)}</ul>
      <Link href="/shop?c=System%20prompt" className="slide inline-block mt-8 bg-crim text-white font-bold px-7 py-3.5 rounded-full">Browse system prompts</Link></div>
      <div className="grid grid-cols-3 gap-3">{MODELS.map(([n, i]) => <Link key={n} href={`/shop?m=${n}`} className="rounded-2xl bg-white/5 hover:bg-crim transition p-4 grid place-items-center gap-2 text-sm font-bold"><Icon n={i} c="w-8 h-8" />{n}</Link>)}</div></div></section>
  </>);
}
