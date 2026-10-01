import { getCfg } from "@/lib/server";
import { safe } from "@/lib/util";
import Icon from "@/components/Icon";
import { ContactForm, OpenHash } from "@/components/ContactBits";
export const revalidate = 60;
export const metadata = { title: "Contact, Help, Privacy and Refund Policy", description: "Get help with orders, custom prompts, privacy, terms and refunds." };
export default async function Contact() {
  const c = await getCfg(), items = [["mail", c.email, `mailto:${c.email}`], ["wa", c.wa, `https://wa.me/${c.waIntl}`], ["insta", "@devwithdav", safe(c.social.insta)], ["pin", c.location, "/contact"]];
  return (<section className="max-w-5xl mx-auto px-4 pt-14"><OpenHash />
    <h1 className="text-4xl sm:text-5xl font-black up">Contact {c.brand}</h1><p className="mt-3 text-neutral-600">Questions about system prompts or a custom prompt order? Reach out and we will reply fast.</p>
    <div className="grid md:grid-cols-5 gap-10 mt-10"><div className="md:col-span-2 space-y-4">{items.map(([i, t, h]) => <a key={i} href={h} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 hover:border-crim hover:-translate-y-0.5 transition"><span className="w-11 h-11 rounded-full bg-crim text-white grid place-items-center"><Icon n={i} /></span><b>{t}</b></a>)}</div><ContactForm /></div>
    <div className="mt-16 space-y-3">{c.pol.map(([id, t, b]) => <details key={id} id={id} className="rounded-2xl border border-neutral-200 bg-white/90 p-5 open:border-crim transition"><summary className="flex justify-between font-bold text-lg">{t}<span className="chev transition"><Icon n="chev" /></span></summary><p className="mt-3 text-neutral-600">{b}</p></details>)}</div></section>);
}
