"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCfg } from "./Providers";
import { MODELS, CATS } from "@/lib/defaults";
import { safe } from "@/lib/util";
import ProductCard from "./ProductCard";
import Icon from "./Icon";
export default function ShopClient({ products }) {
  const cfg = useCfg(), r = useRouter(), sp = useSearchParams(), m = sp.get("m"), c = sp.get("c");
  const go = (k, v) => { const q = new URLSearchParams(sp.toString()); v ? q.set(k, v) : q.delete(k); r.replace("/shop" + (q.toString() ? "?" + q : ""), { scroll: false }); };
  const list = products.filter((p) => (!m || p.model === m) && (!c || p.cat === c));
  return (
    <section className="max-w-7xl mx-auto px-4 pt-10">
      <h1 className="text-3xl sm:text-4xl font-black up">Shop advanced prompt engineering templates</h1>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">{MODELS.map(([n, i]) => {
        const img = safe(cfg.mimg?.[n]), on = m === n;
        return <button key={n} onClick={() => go("m", on ? "" : n)} style={img ? { background: `linear-gradient(${on ? "#DC2626cc,#DC2626cc" : "#1A1A1Acc,#1A1A1Acc"}),url('${img}') center/cover` } : undefined}
          className={`rounded-2xl border p-4 grid place-items-center gap-2 font-bold transition hover:-translate-y-1 ${img ? "min-h-28 text-white border-transparent" : "bg-white/80"} ${on ? "bg-crim border-crim text-white" : "border-neutral-200 hover:border-crim"}`}><Icon n={i} c="w-7 h-7" />{n}</button>;
      })}</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
        <aside><h2 className="font-black text-lg mb-3">Categories</h2><div className="flex md:flex-col gap-2 overflow-x-auto pb-2">
          <button onClick={() => go("c", "")} className={`text-left whitespace-nowrap px-4 py-2.5 rounded-xl font-bold transition ${!c ? "bg-ink text-white" : "hover:bg-neutral-100"}`}>All prompts</button>
          {CATS.map(([n, i]) => <button key={n} onClick={() => go("c", n)} className={`flex items-center gap-2 text-left whitespace-nowrap px-4 py-2.5 rounded-xl font-bold transition ${c === n ? "bg-ink text-white" : "hover:bg-neutral-100"}`}><Icon n={i} c="w-4 h-4" />{n}</button>)}</div></aside>
        <div className="md:col-span-3"><p className="text-sm text-neutral-500 mb-4">{list.length} prompts{m ? ` for ${m}` : ""}</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">{list.map((p) => <ProductCard key={p.id} p={p} />)}
            {!list.length && <p className="col-span-full py-16 text-center text-neutral-500">No prompts match yet. Clear a filter to see more.</p>}</div></div>
      </div>
    </section>
  );
}
