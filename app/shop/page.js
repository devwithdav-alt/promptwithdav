import { Suspense } from "react";
import { getProducts } from "@/lib/server";
import ShopClient from "@/components/ShopClient";
export const revalidate = 60;
export const metadata = { title: "Shop Advanced Prompt Engineering Templates", description: "Browse optimized LLM inputs by AI model and category: image, video, website, mobile app and system prompts." };
export default async function Shop() { return <Suspense><ShopClient products={await getProducts()} /></Suspense>; }
