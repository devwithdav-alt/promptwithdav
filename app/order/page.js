import { Suspense } from "react";
import OrderClient from "@/components/OrderClient";
export const metadata = { title: "Your Order", robots: { index: false, follow: false } };
export default function Page() { return <Suspense><OrderClient /></Suspense>; }
