"use client";
import { useEffect, useState } from "react";
const L = [["s-hero", "Top"], ["s-trend", "Trending"], ["s-power", "Why us"]];
export default function HomeSpy() {
  const [a, setA] = useState("s-hero");
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setA(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    L.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, []);
  return <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">{L.map(([id, t]) => <button key={id} title={t} aria-label={t} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })} className={`block w-3 h-3 my-3 rounded-full border-2 transition ${a === id ? "bg-crim border-crim scale-150" : "bg-white border-ink"}`} />)}</div>;
}
