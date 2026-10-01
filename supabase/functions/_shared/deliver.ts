import { createClient } from "npm:@supabase/supabase-js@2";
export const admin = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const unesc = (s: string) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

export async function deliver(sb: ReturnType<typeof admin>, ref: string) {
  const { data: o } = await sb.from("orders").select("*").eq("reference", ref).single();
  if (!o || o.status === "pending") return { ok: false, error: "Order is not paid yet" };
  const items = o.items as { id: number; title: string }[];
  const { data: files } = await sb.from("prompt_files").select("product_id,content").in("product_id", items.map((i) => i.id));
  const site = Deno.env.get("SITE_URL") || "";
  const link = `${site}/order?ref=${o.reference}`;
  const body = items.map((i) => {
    const c = files?.find((f) => f.product_id === i.id)?.content || "(Prompt text coming soon. Please contact us on WhatsApp.)";
    return `<h2>${esc(unesc(i.title))}</h2><pre style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${esc(c)}</pre>`;
  }).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px"><h1>Thank you for your order</h1><p>Your prompts are below. You can open them any time here: <a href="${link}">${link}</a></p>${body}</div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("FROM_EMAIL"), to: [o.email], subject: "Your PromptWithDav prompts", html }),
  });
  // Optional WhatsApp notification: needs Meta WhatsApp Business Cloud API and an approved template with one {{1}} variable
  const tok = Deno.env.get("WHATSAPP_TOKEN"), pid = Deno.env.get("WHATSAPP_PHONE_ID"), tpl = Deno.env.get("WHATSAPP_TEMPLATE");
  if (tok && pid && tpl) {
    const to = String(o.whatsapp).replace(/\D/g, "").replace(/^0/, "233");
    await fetch(`https://graph.facebook.com/v20.0/${pid}/messages`, {
      method: "POST", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "template",
        template: { name: tpl, language: { code: "en" }, components: [{ type: "body", parameters: [{ type: "text", text: link }] }] } }),
    }).catch(() => {});
  }
  await sb.from("orders").update({ status: r.ok ? "delivered" : "paid" }).eq("reference", ref);
  return { ok: r.ok, error: r.ok ? null : await r.text() };
}
