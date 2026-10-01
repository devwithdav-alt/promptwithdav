"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, useCfg } from "./Providers";
import { MODELS } from "@/lib/defaults";
import { safe, money } from "@/lib/util";
import Icon from "./Icon";
export default function ProductClient({ p }) {
  const { add } = useCart(), cfg = useCfg(), r = useRouter(), [img, setImg] = useState(0), [tab, setTab] = useState(0);
  const T = [<><p>{p.desc}</p><h3 className="font-bold mt-4">What’s inside</h3><ul className="list-disc pl-5 mt-2 space-y-1">{p.inside.map((t, i) => <li key={i}>{t}</li>)}</ul></>,
    <p>Model: <b>{p.model}</b><br />Type: <b>{p.cat}</b><br />Format: plain text, instant delivery</p>, <p>No reviews yet. Be the first to review {p.title}.</p>];
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div><img src={safe(p.images[img])} alt={p.title} className="w-full aspect-square object-cover rounded-3xl up" />
        <div className="grid grid-cols-4 gap-3 mt-3">{p.images.map((s, i) => <img key={i} src={safe(s)} alt="" onClick={() => setImg(i)} className={`aspect-square object-cover rounded-xl cursor-pointer hover:ring-2 ring-crim transition ${i === img ? "ring-2" : ""}`} />)}</div></div>
      <div>
        <Link href={`/shop?m=${encodeURIComponent(p.model)}`} className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-crim hover:text-white transition rounded-full px-4 py-2 font-bold"><Icon n={MODELS.find((m) => m[0] === p.model)?.[1] || "chat"} c="w-4 h-4" />{p.model} Prompts</Link>
        <h1 className="text-3xl sm:text-4xl font-black mt-4">{p.title}</h1><p className="mt-3 text-neutral-600">{p.desc}</p>
        <p className="mt-5 text-3xl font-black text-crim">{p.old && <s className="text-neutral-400 text-xl font-normal mr-2">{money(cfg.cur, p.old)}</s>}{money(cfg.cur, p.price)}</p>
        <div className="flex gap-3 mt-5"><button onClick={() => add(p)} className="slide bg-crim text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-2"><Icon n="cart" />Add to Cart</button>
          <button onClick={() => { add(p); r.push("/checkout"); }} className="font-bold px-8 py-3.5 rounded-full border border-ink hover:bg-ink hover:text-white transition">Buy now</button></div>
        <p className="mt-6 text-sm text-neutral-500">Category: <b className="text-ink">{p.cat}</b><br />Tags: {p.tags.join(", ")}</p>
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/80 p-5"><b>Instant delivery</b><p className="text-sm text-neutral-600">Your prompt text is sent to your email after payment is confirmed.</p></div>
      </div>
      <div className="md:col-span-2 mt-4"><div className="flex gap-2 border-b border-neutral-200">{["Description", "Additional information", "Reviews (0)"].map((t, i) => <button key={t} onClick={() => setTab(i)} className={`px-5 py-3 font-bold border-b-2 -mb-px transition ${tab === i ? "border-crim text-crim" : "border-transparent text-neutral-500"}`}>{t}</button>)}</div>
        <div className="py-6 max-w-3xl">{T[tab]}</div></div>
    </div>
  );
}
