import { createClient } from "@supabase/supabase-js";
import { DEFAULTS, demoProducts } from "./defaults";
import { merge, norm } from "./util";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const hasDb = !!(url && key);
const db = () => createClient(url, key, { auth: { persistSession: false } });
export async function getCfg() {
  const base = structuredClone(DEFAULTS);
  if (!hasDb) return base;
  try { const { data } = await db().from("settings").select("data").eq("id", 1).maybeSingle(); return merge(base, data?.data || {}); } catch { return base; }
}
export async function getProducts() {
  if (!hasDb) return demoProducts();
  try { const { data } = await db().from("products").select("*").eq("active", true).order("id"); return (data || []).map(norm); } catch { return []; }
}
export async function getProduct(slug) { return (await getProducts()).find((p) => p.slug === slug) || null; }
