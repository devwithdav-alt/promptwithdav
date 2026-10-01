import { admin } from "../_shared/deliver.ts";
import { cors, json } from "../_shared/cors.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const { reference } = await req.json().catch(() => ({}));
  if (!/^pwd_[0-9a-f]{24}$/.test(reference || "")) return json({ error: "Not found" }, 404);
  const sb = admin();
  const { data: o } = await sb.from("orders").select("*").eq("reference", reference).single();
  if (!o) return json({ error: "Not found" }, 404);
  let items: any[] = (o.items as any[]).map((i) => ({ id: i.id, title: i.title }));
  if (o.status !== "pending") {
    const { data: f } = await sb.from("prompt_files").select("product_id,content").in("product_id", items.map((i) => i.id));
    items = items.map((i) => ({ ...i, content: f?.find((x) => x.product_id === i.id)?.content || "" }));
  }
  return json({ status: o.status, gateway: o.gateway, email: String(o.email).replace(/(.).+(@.+)/, "$1***$2"), items });
});
