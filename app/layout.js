import "./globals.css";
import { getCfg } from "@/lib/server";
import Providers from "@/components/Providers";
export const revalidate = 60;
export async function generateMetadata() {
  const c = await getCfg();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: `${c.brand} | Production-Ready Prompt Text Templates & System Prompts`, template: `%s | ${c.brand}` },
    description: "Buy production-ready prompt text templates, system prompts and automation workflow strings for ChatGPT, Claude, Gemini, Flow, Grok and Seedance.",
    icons: { icon: c.logo }, openGraph: { siteName: c.brand, type: "website" },
  };
}
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export default async function RootLayout({ children }) {
  const cfg = await getCfg();
  return (<html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" /></head>
    <body><Providers cfg={cfg}>{children}</Providers></body></html>);
}
