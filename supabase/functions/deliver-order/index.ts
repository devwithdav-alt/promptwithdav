import { admin, deliver } from "../_shared/deliver.ts";
import { cors, json } from "../_shared/cors.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const sb = admin();
  const { data: { user } } = await sb.auth.getUser((req.headers.get("Authorization") || "").replace("Bearer ", ""));
  if (!user?.email) return json({ error: "Not signed in" }, 401);
  const { data: a } = await sb.from("admins").select("email").eq("email", user.email).maybeSingle();
  if (!a) return json({ error: "Not allowed" }, 403);
  const { reference } = await req.json().catch(() => ({}));
  await sb.from("orders").update({ status: "paid" }).eq("reference", reference).eq("status", "pending");
  return json(await deliver(sb, reference));
});
