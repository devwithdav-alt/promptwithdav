"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sb } from "@/lib/supabase";
import { DEFAULTS, MODELS, CATS } from "@/lib/defaults";
import { merge, slugify, norm } from "@/lib/util";

const get = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
const put = (o, p, v) => { const ks = p.split("."); if (ks.some((k) => ["__proto__", "constructor", "prototype"].includes(k))) return o; const c = structuredClone(o); let t = c; ks.slice(0, -1).forEach((k) => (t = t[k])); t[ks.at(-1)] = v; return c; };
const J = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const LOCKS = [15, 60, 1440];
const strong = (p) => p.length >= 12 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);
const isAdmin = async () => !!(await sb.from("admins").select("email").maybeSingle()).data;
const resize = (file, max, png) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); c.toBlob(res, png ? "image/png" : "image/jpeg", 0.85); }; im.onerror = rej; im.src = fr.result; };
  fr.readAsDataURL(file);
});
function Field({ label, v, on, type = "text", opts, up }) {
  const cls = "inp mt-1 font-normal"; let el;
  if (type === "bool") return <label className="flex gap-2 items-center font-bold"><input type="checkbox" checked={!!v} onChange={(e) => on(e.target.checked)} className="accent-crim w-4 h-4" />{label}</label>;
  if (type === "range") return <label className="block text-sm font-bold">{label}: {v}<input type="range" min="0" max="40" value={v || 0} onChange={(e) => on(+e.target.value)} className="w-full accent-crim" /></label>;
  if (type === "sel") el = <select className={cls} value={v} onChange={(e) => on(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
  else if (type === "lines" || type === "csv") el = <textarea key={JSON.stringify(v)} className={cls} rows={type === "csv" ? 2 : 4} defaultValue={(v || []).join(type === "csv" ? ", " : "\n")} onBlur={(e) => on(e.target.value.split(type === "csv" ? "," : "\n").map((x) => x.trim()).filter(Boolean))} />;
  else if (type === "area" || type === "raw") el = <textarea className={cls} rows={type === "raw" ? 8 : 3} value={v || ""} onChange={(e) => on(e.target.value)} />;
  else el = <input className={cls} value={v ?? ""} inputMode={type === "num" ? "decimal" : undefined} onChange={(e) => on(e.target.value)} />;
  return <div><label className="block text-sm font-bold">{label}{el}</label>{up && <label className="inline-block mt-1 text-sm text-crim font-bold cursor-pointer hover:underline">{up.accept ? "Upload image or video" : "Upload image"}<input type="file" accept={up.accept || "image/*"} hidden onChange={async (e) => { const u = await up(e.target.files[0]); if (u) on(type === "lines" ? [...(v || []), u] : u); e.target.value = ""; }} /></label>}</div>;
}
export default function AdminClient() {
  const [st, setSt] = useState("loading"), [cfg, setCfg] = useState(null), [prods, setProds] = useState([]), [del, setDel] = useState([]), [tab, setTab] = useState("General"),
    [msg, setMsg] = useState(""), [orders, setOrders] = useState(null), [err, setErr] = useState(""), [lock, setLock] = useState(0), [conf, setConf] = useState(""), idle = useRef();
  const say = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2800); };
  const bump = () => { clearTimeout(idle.current); idle.current = setTimeout(async () => { await sb.auth.signOut(); setSt("out"); }, 9e5); };
  const sure = (k) => { if (conf === k) { setConf(""); return true; } setConf(k); setTimeout(() => setConf(""), 3000); return false; };
  async function loadAll() {
    const [s, p, f] = await Promise.all([sb.from("settings").select("data").eq("id", 1).maybeSingle(), sb.from("products").select("*").order("id"), sb.from("prompt_files").select("*")]);
    setCfg(merge(structuredClone(DEFAULTS), s.data?.data || {}));
    setProds((p.data || []).map((r) => ({ ...norm(r), price: String(r.price), old: r.old_price ? String(r.old_price) : "", images: r.images || [], active: r.active, secret: f.data?.find((x) => x.product_id === r.id)?.content || "" })));
    setSt("in"); bump();
  }
  useEffect(() => { (async () => { if (!sb) return setSt("nodb"); setLock(J("pwd_lock", { u: 0 }).u); const { data } = await sb.auth.getSession(); if (data.session && (await isAdmin())) await loadAll(); else setSt("out"); })(); return () => clearTimeout(idle.current); }, []);
  useEffect(() => { if (tab === "Orders" && st === "in") sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setOrders(data || [])); }, [tab, st]);
  async function login(e) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); if (f.website) return;
    const L = J("pwd_lock", { f: 0, u: 0, l: 0 }); if (L.u > Date.now()) return setLock(L.u);
    const { error } = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
    if (!error && (await isAdmin())) { localStorage.setItem("pwd_lock", JSON.stringify({ f: 0, u: 0, l: 0 })); setErr(""); return loadAll(); }
    if (!error) await sb.auth.signOut();
    L.f++; if (L.f >= 3) { L.u = Date.now() + LOCKS[Math.min(L.l, 2)] * 6e4; L.l++; L.f = 0; }
    localStorage.setItem("pwd_lock", JSON.stringify(L)); setLock(L.u); await new Promise((r) => setTimeout(r, 600));
    setErr(L.u > Date.now() ? "" : `Incorrect email or password. ${3 - L.f} attempt${3 - L.f === 1 ? "" : "s"} left.`);
  }
  async function save() {
    const rows = prods.map((p) => ({ id: p.id, slug: slugify(p.title) + "-" + p.id, title: p.title, price: Math.max(0, +p.price || 0), old_price: +p.old > 0 ? +p.old : null, model: p.model, category: p.cat, trending: !!p.trending, description: p.desc, inside: p.inside || [], tags: p.tags || [], images: p.images || [], active: p.active !== false }));
    const e = [(await sb.from("settings").upsert({ id: 1, data: cfg })).error];
    if (del.length) { e.push((await sb.from("products").delete().in("id", del)).error); setDel([]); }
    if (rows.length) { e.push((await sb.from("products").upsert(rows)).error); e.push((await sb.from("prompt_files").upsert(prods.map((p) => ({ product_id: p.id, content: p.secret || "" })))).error); }
    const b = e.find(Boolean); say(b ? "Save failed: " + b.message : "Saved. Your site updates within a minute."); bump();
  }
  const upFor = (max, png) => async (f) => {
    if (!f || !/^image\/(png|jpe?g|webp|gif)$/.test(f.type) || f.size > 6e6) { say("Use a PNG, JPG or WebP under 6MB"); return; }
    const b = await resize(f, max, png), path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${png ? "png" : "jpg"}`;
    const { error } = await sb.storage.from("media").upload(path, b, { contentType: b.type, cacheControl: "31536000" });
    if (error) { say(error.message); return; } say("Uploaded. Press Save changes."); return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  };
  const upMedia = async (f) => {
    if (f && f.type.startsWith("video/")) {
      if (!/^video\/(mp4|webm)$/.test(f.type) || f.size > 20e6) { say("Video must be MP4 or WebM and under 20MB. For longer videos, paste a YouTube link instead."); return; }
      say("Uploading video…");
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${f.type === "video/webm" ? "webm" : "mp4"}`;
      const { error } = await sb.storage.from("media").upload(path, f, { contentType: f.type, cacheControl: "31536000" });
      if (error) { say(error.message); return; } say("Video uploaded. Press Save changes."); return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    }
    return upFor(1000)(f);
  };
  upMedia.accept = "image/*,video/mp4,video/webm";
  if (st === "loading") return <p className="p-20 text-center font-bold">Loading…</p>;
  if (st === "nodb") return <p className="p-20 text-center font-bold">Backend not connected. Add your Supabase keys to the environment variables.</p>;
  if (st === "out") { const locked = lock > Date.now(); return (
    <section className="max-w-md mx-auto px-4 pt-20"><form onSubmit={login} className="rounded-3xl border border-neutral-200 bg-white p-8 space-y-4 shadow-xl"><h1 className="text-2xl font-black">Admin sign in</h1>
      {locked ? <p className="text-crim font-bold">Too many failed attempts. Locked for {Math.ceil((lock - Date.now()) / 6e4)} more minutes.</p> : <>
        <label className="block text-sm font-bold">Admin email<input className="inp mt-1 font-normal" name="email" type="email" required autoComplete="username" /></label>
        <label className="block text-sm font-bold">Password<input className="inp mt-1 font-normal" name="password" type="password" required autoComplete="current-password" /></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" /><p className="text-crim font-bold text-sm">{err}</p><button className="slide w-full bg-crim text-white font-bold py-3 rounded-full">Sign in</button></>}
      <Link href="/" className="block text-center text-sm text-neutral-500 hover:text-crim">Back to site</Link></form></section>); }
  const c = (p, l, t, u) => <Field key={p} label={l} v={get(cfg, p)} type={t} up={u} on={(v) => setCfg((x) => put(x, p, v))} />;
  const H = (t) => <h2 key={t} className="text-xl font-black pt-2">{t}</h2>;
  const T = ["General", "Home", "About", "Appearance", "Products", "Payments", "Orders", "Policies", "Security"];
  const orderLink = (o) => `${location.origin}/order?ref=${o.reference}`;
  const waLink = (o) => {
    let n = String(o.whatsapp).replace(/\D/g, ""); if (n.startsWith("0")) n = "233" + n.slice(1);
    const items = (o.items || []).map((i) => `${i.title} x${i.qty}`).join(", ");
    const note = cfg.pay.find((g) => g.id === o.gateway)?.note || "";
    const msg = o.status === "pending"
      ? `Hi! Thanks for your order of ${items} (${cfg.cur}${Number(o.amount).toFixed(2)}). ${note} Order reference: ${o.reference}`
      : `Hi! Your payment is confirmed. Your prompts are ready here: ${orderLink(o)}`;
    return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
  };
  const body = {
    General: () => [c("brand", "Brand name"), c("cta", "Header button text"), c("ticker", "Ticker text", "area"), c("cur", "Currency symbol"), c("email", "Email"), c("wa", "WhatsApp (local format)"), c("waIntl", "WhatsApp, international digits only"), c("location", "Location"), c("copy", "Footer copyright"), c("by", "Footer credit"),
      H("Menu"), ...cfg.nav.flatMap((_, i) => [c(`nav.${i}.0`, `Menu ${i + 1} label`), c(`nav.${i}.1`, `Menu ${i + 1} link (e.g. /shop)`)]), H("Social links"), ...Object.keys(cfg.social).map((k) => c("social." + k, k + " link")),
      H("Checkout text"), c("co.title", "Checkout title"), c("co.btn", "Order button text"), c("co.waPh", "WhatsApp placeholder")],
    Home: () => [c("hero.title", "Hero headline"), c("hero.sub", "Hero subtext", "area"), c("power.title", "Most powerful AI title"), c("power.text", "Most powerful AI text", "area"), ...[0, 1, 2].map((i) => c("power.points." + i, "Point " + (i + 1)))],
    About: () => [c("about.badge", "Badge"), c("about.title", "Headline"), c("about.body", "Body", "area"), c("about.portrait", "Portrait image", "text", upFor(1000)), c("about.signature", "Signature PNG", "text", upFor(600, true)), ...cfg.stats.flatMap((_, i) => [c(`stats.${i}.h`, `Card ${i + 1} headline`), c(`stats.${i}.t`, `Card ${i + 1} text`)])],
    Appearance: () => [c("logo", "Logo image", "text", upFor(400, true)), H("Background image"), <p key="n" className="text-sm text-neutral-500">Paste any image link or upload one. Clear the box to keep the plain white look.</p>, c("bg.on", "Show background", "bool"), c("bg.img", "Background image (link or upload)", "text", upFor(1600)), c("bg.o", "Image strength", "range"),
      H("AI model banner images"), ...MODELS.map((m) => c("mimg." + m[0], m[0] + " banner image", "text", upFor(800)))],
    Products: () => [<button key="a" onClick={() => setProds((p) => [...p, { id: Math.max(0, ...p.map((x) => x.id)) + 1, slug: "", title: "New prompt", price: "4.99", old: "", model: "ChatGPT", cat: "Image prompt", trending: false, desc: "", inside: [], tags: [], images: [], secret: "", active: true }])} className="justify-self-start bg-ink text-white font-bold px-5 py-2.5 rounded-full hover:bg-crim transition">Add product</button>,
      ...prods.map((p, i) => { const q = (k, l, t, o, u) => <Field key={k} label={l} v={p[k]} type={t} opts={o} up={u} on={(v) => setProds((ps) => ps.map((x, j) => (j === i ? { ...x, [k]: v } : x)))} />;
        return <details key={p.id} className="rounded-2xl border border-neutral-200 p-4"><summary className="font-bold flex justify-between items-center gap-3 cursor-pointer"><span>{p.title} · {p.price}</span>
          <button onClick={(e) => { e.preventDefault(); if (sure("p" + p.id)) { setDel((d) => [...d, p.id]); setProds((ps) => ps.filter((x) => x.id !== p.id)); } }} className="text-crim text-sm hover:underline">{conf === "p" + p.id ? "Click again to confirm" : "Delete"}</button></summary>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">{q("title", "Title")}{q("price", "Price", "num")}{q("old", "Old price (optional)", "num")}{q("model", "AI model", "sel", MODELS.map((m) => m[0]))}{q("cat", "Category", "sel", CATS.map((m) => m[0]))}{q("trending", "Show in trending", "bool")}
            <div className="sm:col-span-2">{q("desc", "Description", "area")}</div>{q("tags", "Tags (comma separated)", "csv")}{q("inside", "What is inside (one per line)", "lines")}
            <div className="sm:col-span-2">{q("images", "Media: images and video previews (one link per line; put a cover image first)", "lines", null, upMedia)}</div><div className="sm:col-span-2">{q("secret", "Prompt text delivered after payment (private)", "raw")}</div></div></details>; })],
    Payments: () => [<p key="n" className="text-sm text-neutral-500">Paste your Paystack PUBLIC key (starts with pk_) and tick Active to switch Paystack on. Never paste a secret key here. Add manual methods (bank transfer, MoMo number) below.</p>,
      ...cfg.pay.map((g, i) => <div key={g.id} className="rounded-2xl border border-neutral-200 p-4 grid gap-3">{c(`pay.${i}.on`, "Active", "bool")}{c(`pay.${i}.label`, "Name")}{c(`pay.${i}.sub`, "Short note")}
        {g.type === "paystack" ? c(`pay.${i}.key`, "Paystack public key (pk_test_… or pk_live_…)") : c(`pay.${i}.note`, "Instructions shown after the order", "area")}
        {g.type === "manual" && <button onClick={() => sure("g" + g.id) && setCfg((x) => ({ ...x, pay: x.pay.filter((y) => y.id !== g.id) }))} className="justify-self-start text-crim text-sm hover:underline">{conf === "g" + g.id ? "Click again to confirm" : "Remove method"}</button>}</div>),
      <button key="add" onClick={() => setCfg((x) => ({ ...x, pay: [...x.pay, { id: "g" + Date.now(), type: "manual", on: true, label: "New payment method", sub: "", key: "", note: "" }] }))} className="justify-self-start bg-ink text-white font-bold px-5 py-2.5 rounded-full hover:bg-crim transition">Add manual payment method</button>],
    Orders: () => orders === null ? [<p key="l" className="text-neutral-500">Loading orders…</p>] : orders.length ? orders.map((o) => <div key={o.id} className="rounded-2xl border border-neutral-200 p-4 flex flex-wrap justify-between gap-3 items-center"><div className="text-sm"><b>{o.email}</b> · {o.whatsapp} {o.telegram ? "· " + o.telegram : ""}<br />{cfg.cur}{Number(o.amount).toFixed(2)} · {o.gateway} · <b className={o.status === "pending" ? "text-crim" : ""}>{o.status}</b> · {new Date(o.created_at).toLocaleString()}<br /><span className="text-neutral-500">{(o.items || []).map((i) => `${i.title} ×${i.qty}`).join(", ")}</span></div>
      <div className="flex flex-wrap gap-2"><button onClick={async (e) => { e.currentTarget.disabled = true; const { data, error } = await sb.functions.invoke("deliver-order", { body: { reference: o.reference } }); say(error || !data?.ok ? "Delivery failed: " + (data?.error || error?.message || "") : "Delivered"); const r = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100); setOrders(r.data || []); }} className="bg-ink text-white font-bold px-4 py-2 rounded-full hover:bg-crim transition">{o.status === "pending" ? "Mark paid & deliver" : "Resend email"}</button><button onClick={() => { navigator.clipboard.writeText(orderLink(o)); say("Order link copied"); }} className="border border-ink font-bold px-4 py-2 rounded-full hover:bg-ink hover:text-white transition">Copy order link</button><a href={waLink(o)} target="_blank" rel="noopener noreferrer" className="border border-crim text-crim font-bold px-4 py-2 rounded-full hover:bg-crim hover:text-white transition">WhatsApp customer</a></div></div>) : [<p key="e" className="text-neutral-500">No orders yet.</p>],
    Policies: () => cfg.pol.flatMap((_, i) => [c(`pol.${i}.1`, "Title"), c(`pol.${i}.2`, "Text", "area")]),
    Security: () => [<form key="f" className="grid gap-3 max-w-sm" onSubmit={async (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); if (!strong(f.nw) || f.nw !== f.nw2) return say("New password needs 12+ characters with upper case, lower case, a number, and must match."); const { error } = await sb.auth.updateUser({ password: f.nw }); e.target.reset(); say(error ? error.message : "Password changed"); }}>
      <h2 className="text-xl font-black">Change password</h2><label className="block text-sm font-bold">New password<input className="inp mt-1 font-normal" name="nw" type="password" required autoComplete="new-password" /></label><label className="block text-sm font-bold">Confirm new password<input className="inp mt-1 font-normal" name="nw2" type="password" required autoComplete="new-password" /></label><button className="bg-crim text-white font-bold py-3 rounded-full">Update password</button></form>,
      <p key="p" className="text-sm text-neutral-600">Sign-in is handled by Supabase Auth, which rate-limits attempts on the server, plus a 3-strike lockout here (15 min, 1 hour, 24 hours). Sessions end after 15 idle minutes. Turn on CAPTCHA in the Supabase dashboard for extra protection.</p>,
      <button key="r" onClick={async () => { if (sure("reset")) { await sb.from("settings").delete().eq("id", 1); location.reload(); } }} className="justify-self-start px-4 py-2 rounded-full border border-crim text-crim font-bold hover:bg-crim hover:text-white transition">{conf === "reset" ? "Click again to confirm" : "Reset site content to defaults"}</button>],
  };
  return (
    <section className="max-w-5xl mx-auto px-4 py-8" onClick={bump}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black">Admin: {cfg.brand}</h1><div className="flex gap-2"><Link href="/" className="px-4 py-2 rounded-full border border-ink font-bold hover:bg-ink hover:text-white transition">View site</Link><button onClick={async () => { await sb.auth.signOut(); setSt("out"); }} className="px-4 py-2 rounded-full bg-ink text-white font-bold hover:bg-crim transition">Log out</button></div></div>
      <div className="flex gap-2 overflow-x-auto mt-6 pb-2">{T.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${t === tab ? "bg-crim text-white" : "bg-neutral-100 hover:bg-neutral-200"}`}>{t}</button>)}</div>
      <div className="mt-6 grid gap-4 bg-white/90 rounded-2xl border border-neutral-200 p-5 sm:p-7">{body[tab]()}</div>
      <div className="sticky bottom-4 mt-6 flex justify-end items-center gap-3">{msg && <span className="bg-ink text-white px-4 py-2 rounded-full text-sm">{msg}</span>}<button onClick={save} className="slide bg-crim text-white font-bold px-8 py-3.5 rounded-full shadow-xl">Save changes</button></div>
    </section>
  );
}
