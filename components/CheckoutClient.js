"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, useCfg } from "./Providers";
import { sb } from "@/lib/supabase";
import { safe, money } from "@/lib/util";
import Icon from "./Icon";
export default function CheckoutClient() {
  const cfg = useCfg(), { cart, total, remove, clear, toast } = useCart(), r = useRouter(), last = useRef(0);
  const G = cfg.pay.filter((g) => g.on && g.type !== "paystack"), [pay, setPay] = useState(G[0]?.id), [busy, setBusy] = useState(false), [wa, setWa] = useState("");
  async function submit(e) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); if (f.website) return;
    if (Date.now() - last.current < 5e3) return toast("Please wait a moment before trying again");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) || !/^[+]?[0-9]{9,15}$/.test(wa)) return toast("Check your email and WhatsApp number");
    if (!cart.length) return toast("Your cart is empty");
    if (!sb) return toast("Backend not connected yet. Add your Supabase keys.");
    last.current = Date.now(); setBusy(true);
    const { data, error } = await sb.functions.invoke("create-order", { body: { items: cart.map((i) => ({ id: i.id, qty: i.qty })), email: f.email, wa, tg: f.tg || "", gateway: pay, hp: "" } });
    setBusy(false);
    if (error || !data || data.error) return toast((data && data.error) || "Could not create your order. Try again.");
    clear(); r.push("/order?ref=" + data.reference);
  }
  return (
    <section className="max-w-5xl mx-auto px-4 pt-12"><h1 className="text-4xl font-black">{cfg.co.title}</h1>
      <form onSubmit={submit} className="grid md:grid-cols-5 gap-10 mt-8">
        <div className="md:col-span-3 space-y-6"><h2 className="text-xl font-black">Contact information</h2>
          <label className="block font-bold">Email address<input className="inp mt-1 font-normal" type="email" name="email" placeholder="you@example.com" required maxLength={120} autoComplete="email" /></label>
          <label className="block font-bold">WhatsApp number<input className="inp mt-1 font-normal" type="tel" inputMode="tel" pattern="[+]?[0-9]*" maxLength={15} placeholder={cfg.co.waPh} required autoComplete="tel" value={wa} onChange={(e) => setWa(e.target.value.replace(/(?!^[+])[^0-9]/g, ""))} /></label>
          <label className="block font-bold">Telegram handle (optional)<input className="inp mt-1 font-normal" name="tg" maxLength={40} placeholder="@yourhandle" /></label>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
          <h2 className="text-xl font-black pt-2">Payment</h2>
          {G.map((x) => <label key={x.id} className={`flex gap-4 items-center rounded-2xl border p-4 cursor-pointer transition bg-white/80 ${pay === x.id ? "border-crim" : "border-neutral-200"}`}><input type="radio" name="pay" checked={pay === x.id} onChange={() => setPay(x.id)} className="accent-crim w-4 h-4" /><span className="text-crim"><Icon n={x.type === "paystack" ? "card" : "bank"} c="w-6 h-6" /></span><span><b className="block">{x.label}</b><small className="text-neutral-500">{x.sub}</small></span></label>)}
          {!G.length && <p className="text-neutral-500">No payment method is active right now.</p>}</div>
        <aside className="md:col-span-2"><div className="rounded-2xl border border-neutral-200 bg-white/90 p-5 md:sticky md:top-36"><h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-4 space-y-3">{cart.map((i) => <div key={i.id} className="flex gap-3 items-center"><img src={safe(i.image)} alt="" className="w-14 h-14 rounded-lg object-cover" /><div className="flex-1 text-sm"><b>{i.title}</b><br /><span className="text-neutral-500">Qty {i.qty} · {money(cfg.cur, i.price * i.qty)}</span></div><button type="button" onClick={() => remove(i.id)} aria-label={`Remove ${i.title}`} className="p-1 text-neutral-400 hover:text-crim"><Icon n="x" c="w-4 h-4" /></button></div>)}
            {!cart.length && <p className="text-neutral-500">Your cart is empty. <Link className="text-crim font-bold" href="/shop">Find a prompt</Link></p>}</div>
          <div className="flex justify-between border-t border-neutral-200 mt-5 pt-4 text-lg font-black"><span>Total</span><span>{money(cfg.cur, total)}</span></div>
          <button disabled={!cart.length || !pay || busy} className="slide w-full mt-5 bg-crim text-white font-bold py-4 rounded-full disabled:opacity-50">{busy ? "Placing order…" : cfg.co.btn}</button></div></aside>
      </form></section>
  );
}
