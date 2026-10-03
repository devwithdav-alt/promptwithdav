"use client";
import Link from "next/link";
import { useCart, useCfg } from "./Providers";
import { safe, money, mediaInfo } from "@/lib/util";
import Icon from "./Icon";
export default function ProductCard({ p }) {
  const { add } = useCart(), cfg = useCfg();
  return (
    <div className="group relative rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:-translate-y-1 hover:shadow-xl transition duration-300">
      <Link href={`/product/${p.slug}`} aria-label={p.title} className="absolute inset-0 z-10" />
      <div className="relative aspect-square overflow-hidden"><img src={safe(p.images[0])} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        {(p.media || []).some((u) => mediaInfo(u).type !== "image") && <span className="pointer-events-none absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-bold text-white"><Icon n="video" c="w-3.5 h-3.5" />Video preview</span>}
        <button onClick={() => add(p)} aria-label={`Add ${p.title} to cart`} className="absolute right-2 bottom-2 z-20 w-10 h-10 rounded-full bg-crim text-white grid place-items-center shadow-lg hover:scale-110 active:scale-95 transition"><Icon n="cart" /></button></div>
      <div className="p-3 sm:p-4"><p className="text-xs text-neutral-500 truncate">{p.model} · {p.cat}</p><h3 className="font-bold leading-snug">{p.title}</h3>
        <p className="mt-1 font-black text-crim">{p.old && <s className="text-neutral-400 font-normal mr-1">{money(cfg.cur, p.old)}</s>}{money(cfg.cur, p.price)}</p></div>
    </div>
  );
}
