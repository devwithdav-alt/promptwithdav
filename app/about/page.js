import { getCfg } from "@/lib/server";
import { safe } from "@/lib/util";
import Icon from "@/components/Icon";
export const revalidate = 60;
export const metadata = { title: "About | Independent Prompt Engineer", description: "Meet the independent prompt engineer behind refined, reliable, production-ready AI inputs." };
export default async function About() {
  const { about: a, stats } = await getCfg();
  return (<>
    <section className="max-w-6xl mx-auto px-4 pt-14 grid md:grid-cols-2 gap-12 items-center"><div className="up">
      <span className="inline-block bg-crim/10 text-crim font-bold rounded-full px-4 py-1.5 text-sm">{a.badge}</span>
      <h1 className="text-4xl sm:text-6xl font-black leading-tight mt-5">{a.title}</h1><p className="mt-5 text-lg text-neutral-600 max-w-lg">{a.body}</p>
      {safe(a.signature) ? <img src={safe(a.signature)} alt="Signature" className="h-16 mt-8" /> : <svg className="h-16 mt-8 text-ink" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M8 40c20-40 30-40 24-10s10 20 22-8c-6 22 6 20 18 0 4 12 16 12 28-2 14 8 30 4 50-6" /></svg>}</div>
      <div className="up rounded-3xl overflow-hidden bg-neutral-100 aspect-[4/5] grid place-items-center" style={{ animationDelay: ".15s" }}>{safe(a.portrait) ? <img src={safe(a.portrait)} alt="Creator workspace portrait" className="w-full h-full object-cover" /> : <span className="text-neutral-400 font-bold">Portrait photo goes here</span>}</div></section>
    <section className="max-w-6xl mx-auto px-4 mt-16 grid md:grid-cols-3 gap-5">{stats.map((s, i) => <div key={i} className="rounded-2xl border border-neutral-200 bg-white/90 p-7 hover:-translate-y-1 hover:shadow-xl transition"><span className="w-12 h-12 rounded-full bg-crim text-white grid place-items-center"><Icon n={s.i} c="w-6 h-6" /></span><h3 className="text-xl font-black mt-5">{s.h}</h3><p className="mt-2 text-neutral-600">{s.t}</p></div>)}</section>
  </>);
}
