export default function robots() {
  const s = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/order"] }, sitemap: `${s}/sitemap.xml` };
}
