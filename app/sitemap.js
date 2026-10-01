import { getProducts } from "@/lib/server";
export const revalidate = 3600;
export default async function sitemap() {
  const s = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", now = new Date();
  const pages = ["", "/shop", "/about", "/contact"].map((p) => ({ url: s + p, lastModified: now }));
  return [...pages, ...(await getProducts()).map((p) => ({ url: `${s}/product/${p.slug}`, lastModified: now }))];
}
