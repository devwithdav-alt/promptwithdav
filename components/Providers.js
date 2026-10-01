"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header, Footer, Bg, Preloader, Progress } from "./Chrome";
const C = createContext(), K = createContext();
export const useCfg = () => useContext(C);
export const useCart = () => useContext(K);
export default function Providers({ cfg, children }) {
  const [cart, setCart] = useState([]), [msg, setMsg] = useState(""), adm = usePathname().startsWith("/admin");
  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("pwd_cart") || "[]")); } catch {} }, []);
  const put = (c) => { setCart(c); try { localStorage.setItem("pwd_cart", JSON.stringify(c)); } catch {} };
  const toast = (m) => { setMsg(m); clearTimeout(globalThis.__t); globalThis.__t = setTimeout(() => setMsg(""), 1800); };
  const add = (p) => {
    put(cart.find((i) => i.id == p.id) ? cart.map((i) => (i.id == p.id ? { ...i, qty: Math.min(10, i.qty + 1) } : i))
      : [...cart, { id: p.id, slug: p.slug, title: p.title, price: p.price, image: p.images[0], qty: 1 }]);
    toast("Added to cart");
  };
  const val = { cart, add, toast, remove: (id) => put(cart.filter((i) => i.id != id)), clear: () => put([]),
    count: cart.reduce((a, i) => a + i.qty, 0), total: cart.reduce((a, i) => a + i.qty * i.price, 0) };
  return (
    <C.Provider value={cfg}><K.Provider value={val}>
      <Preloader /><Bg /><Progress />
      {!adm && <Header />}
      <main className="min-h-[70vh]">{children}</main>
      {!adm && <Footer />}
      <div role="status" className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 bg-ink text-white px-5 py-3 rounded-full shadow-xl pointer-events-none transition ${msg ? "opacity-100" : "opacity-0"}`}>{msg}</div>
    </K.Provider></C.Provider>
  );
}
