import { admin } from "../_shared/deliver.ts";
import { cors, json } from "../_shared/cors.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const b = await req.json();
    if (b.hp) return json({ error: "Rejected" }, 400);
    const email = String(b.email || "").trim().slice(0, 120), wa = String(b.wa || ""), tg = String(b.tg || "").slice(0, 40);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !/^[+]?[0-9]{9,15}$/.test(wa)) return json({ error: "Invalid contact details" }, 400);
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 20)
      .map((i: any) => ({ id: +i.id, qty: Math.min(10, Math.max(1, +i.qty | 0)) }));
    if (!items.length) return json({ error: "Your cart is empty" }, 400);
    const sb = admin();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const since = new Date(Date.now() - 10 * 60000).toISOString();
    const { count } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since);
    if ((count ?? 0) >= 8) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
    const { data: prods } = await sb.from("products").select("id,title,price").in("id", items.map((i) => i.id)).eq("active", true);
    if (!prods || prods.length !== new Set(items.map((i) => i.id)).size) return json({ error: "A product is no longer available" }, 400);
    const lines = items.map((i) => { const p = prods.find((x) => x.id === i.id)!; return { id: p.id, title: p.title, price: +p.price, qty: i.qty }; });
    const amount = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const reference = "pwd_" + [...crypto.getRandomValues(new Uint8Array(12))].map((x) => x.toString(16).padStart(2, "0")).join("");
    const { error } = await sb.from("orders").insert({ reference, email, whatsapp: wa, telegram: tg, items: lines, amount, gateway: String(b.gateway || "").slice(0, 40), ip });
    if (error) return json({ error: "Could not create order" }, 500);
    return json({ reference, email, wa, amount: Math.round(amount * 100) });
  } catch { return json({ error: "Bad request" }, 400); }
});
