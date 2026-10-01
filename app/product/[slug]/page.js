import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getProducts, getCfg } from "@/lib/server";
import ProductClient from "@/components/ProductClient";
import ProductCard from "@/components/ProductCard";
export const revalidate = 60;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug); if (!p) return {};
  return { title: p.title, description: p.desc.slice(0, 155), openGraph: { title: p.title, description: p.desc.slice(0, 155), images: p.images[0]?.startsWith("http") ? [p.images[0]] : [] } };
}
export default async function ProductPage({ params }) {
  const [p, cfg, all] = await Promise.all([getProduct(params.slug), getCfg(), getProducts()]); if (!p) notFound();
  const rel = all.filter((x) => x.id !== p.id && (x.model === p.model || x.cat === p.cat)).slice(0, 4);
  const ld = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.title, description: p.desc, image: p.images[0], offers: { "@type": "Offer", price: p.price, priceCurrency: "GHS", availability: "https://schema.org/InStock" } }).replace(/</g, "\\u003c");
  return (<section className="max-w-6xl mx-auto px-4 pt-10">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
    <ProductClient p={p} />
    {rel.length > 0 && <><h2 className="text-2xl font-black mt-14 mb-5">Related products</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">{rel.map((x) => <ProductCard key={x.id} p={x} />)}</div></>}
  </section>);
}
