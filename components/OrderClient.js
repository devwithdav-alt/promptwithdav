"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCfg, useCart } from "./Providers";
import { sb } from "@/lib/supabase";
import Icon from "./Icon";
export default function OrderClient() {
  const ref = useSearchParams().get("ref") || "", cfg = useCfg(), { toast } = useCart(), [o, setO] = useState(null), [bad, setBad] = useState(false);
  useEffect(() => {
    let n = 0, t, dead = false;
    const run = async () => {
      if (!sb) return setBad(true);
      const { data, error } = await sb.functions.invoke("get-order", { body: { reference: ref } });
      if (dead) return; if (error || !data || data.error) return setBad(true);
      setO(data); if (data.status === "pending" && n++ < 40) t = setTimeout(run, 4000);
    };
    run(); return () => { dead = true; clearTimeout(t); };
  }, [ref]);
  const g = cfg.pay.find((x) => x.id === o?.gateway);
  return (
    <section className="max-w-2xl mx-auto px-4 pt-16"><div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 sm:p-8 text-center">
      {bad ? <><h1 className="text-2xl font-black">Order not found</h1><p className="mt-2 text-neutral-600">Check the link in your email, or message us on WhatsApp.</p></>
        : !o ? <p className="font-bold">Loading your order…</p>
        : o.status === "pending" ? <><h1 className="text-2xl font-black">{g?.type === "manual" ? "Awaiting your transfer" : "Confirming your payment"}</h1><p className="mt-3 text-neutral-600">{g?.type === "manual" ? g.note : "This page updates by itself."}</p><p className="mt-4 text-sm text-neutral-500">Order {ref}</p></>
        : <><span className="w-14 h-14 rounded-full bg-crim text-white grid place-items-center mx-auto"><Icon n="check" c="w-7 h-7" /></span><h1 className="text-2xl font-black mt-4">Your prompts are ready</h1><p className="mt-2 text-neutral-600">A copy was emailed to {o.email}.</p>
          <div className="text-left mt-6 space-y-6">{o.items.map((i) => <div key={i.id}><div className="flex justify-between items-center gap-3"><h2 className="font-black">{i.title}</h2><button onClick={() => { navigator.clipboard.writeText(i.content || ""); toast("Copied"); }} className="text-crim font-bold text-sm hover:underline">Copy</button></div><pre className="whitespace-pre-wrap rounded-xl bg-ink text-white p-4 mt-2 text-sm">{i.content || "Prompt text is being added. Message us on WhatsApp."}</pre></div>)}</div></>}
      <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${cfg.waIntl}?text=${encodeURIComponent("Hi, my order reference is " + ref)}`} className="slide inline-flex items-center gap-2 mt-8 bg-crim text-white font-bold px-6 py-3 rounded-full"><Icon n="wa" />Need help? WhatsApp us</a>
    </div></section>
  );
}
