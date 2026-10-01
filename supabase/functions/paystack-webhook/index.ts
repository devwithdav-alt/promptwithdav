import { admin, deliver } from "../_shared/deliver.ts";
Deno.serve(async (req) => {
  const body = await req.text();
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(Deno.env.get("PAYSTACK_SECRET_KEY")!),
    { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hex !== req.headers.get("x-paystack-signature")) return new Response("invalid", { status: 401 });
  const evt = JSON.parse(body);
  if (evt.event === "charge.success") {
    const sb = admin(), d = evt.data;
    const { data: o } = await sb.from("orders").select("amount,status").eq("reference", d.reference).single();
    if (o && o.status === "pending" && Math.round(o.amount * 100) === d.amount && d.currency === "GHS") {
      await sb.from("orders").update({ status: "paid" }).eq("reference", d.reference);
      await deliver(sb, d.reference);
    }
  }
  return new Response("ok");
});
