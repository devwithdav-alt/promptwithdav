export const safe = (u) => { u = String(u || "").trim(); return /^(\/(?!\/)|https?:\/\/|data:image\/)/i.test(u) ? u : ""; };
export const money = (c, n) => c + Number(n).toFixed(2);
export const slugify = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "prompt";
export const merge = (a, b) => {
  for (const k in b) {
    if (["__proto__", "constructor", "prototype"].includes(k)) continue;
    a[k] = b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object" ? merge(a[k], b[k]) : b[k];
  }
  return a;
};
export const ph = (n, l = "PREVIEW") =>
  "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="${["#1A1A1A", "#2b2b2b", "#3a3a3a"][n % 3]}"/><circle cx="${150 + (n * 60) % 300}" cy="${200 + (n * 40) % 200}" r="170" fill="#DC2626" opacity=".85"/><rect x="60" y="440" width="300" height="14" rx="7" fill="#fff" opacity=".9"/><rect x="60" y="474" width="200" height="14" rx="7" fill="#fff" opacity=".5"/><text x="60" y="90" font-family="Lato,sans-serif" font-weight="900" font-size="44" fill="#fff">${l}</text></svg>`);
export const norm = (r) => ({
  id: r.id, slug: r.slug, title: r.title, price: +r.price, old: r.old_price ? +r.old_price : null, model: r.model, cat: r.category,
  trending: !!r.trending, desc: r.description || "", inside: r.inside || [], tags: r.tags || [],
  images: r.images && r.images.length ? r.images : [ph(r.id)],
});
