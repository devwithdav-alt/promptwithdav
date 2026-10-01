import { ph } from "./util";
export const MODELS = [["ChatGPT", "chat"], ["Claude", "sparkle"], ["Gemini", "gemini"], ["Flow", "flow"], ["Grok", "zap"], ["Seedance", "film"]];
export const CATS = [["Image prompt", "image"], ["Video prompt", "video"], ["Website prompt", "globe"], ["Mobile app prompt", "phone"], ["System prompt", "terminal"]];
export const DEFAULTS = {
  brand: "PromptWithDav", logo: "/logo.png", cur: "GH₵", email: "devwithdav@gmail.com", wa: "0530179643", waIntl: "233530179643", location: "Greater Accra",
  cta: "Discover Prompts",
  ticker: "Discover, Design & Acquire Powerful AI Prompts • Transform your workflows with production-ready AI text templates • Engineered for accuracy",
  nav: [["Home", "/"], ["Shop", "/shop"], ["Contact", "/contact"], ["About", "/about"]],
  hero: { title: "Discover, Design & Acquire Powerful AI Prompts", sub: "Production-ready prompt text templates, system prompts and automation workflow strings, built with advanced prompt engineering." },
  power: { title: "The most powerful AI prompts, ready to run", text: "Every template is tested for optimized LLM inputs, so you spend less time rewriting and more time shipping.", points: ["Tested on ChatGPT, Claude, Gemini, Flow, Grok and Seedance", "Copy, paste and customise in minutes", "Free updates when models change"] },
  about: { badge: "About promptwithdav", title: "Good prompts start with clear thinking.", body: "I’m an independent prompt engineer creating highly refined, reliable, and production-ready AI inputs shaped by strategic engineering and thoughtful execution.", portrait: "", signature: "" },
  stats: [
    { i: "star", h: "10k+ Prompts Executed", t: "Powering workflows, automation pipelines, and creators globally." },
    { i: "users", h: "500+ Happy Creators", t: "Trusted by developers, designers, and agencies globally." },
    { i: "send", h: "Available For custom prompts", t: "Currently open for tailored enterprise prompt generation." }],
  social: { insta: "https://instagram.com/devwithdav", tt: "https://tiktok.com/@devwithdav", fb: "https://facebook.com/devwithdav", wa: "https://wa.me/233530179643" },
  copy: "Copyright © 2026 promptwithdav. All Rights Reserved.", by: "Built by @devwithdav",
  bg: { on: true, img: "/bg.svg", o: 14 }, mimg: {},
  pol: [
    ["help", "Help", "Orders are delivered as plain text to your email right after payment. If nothing arrives within 15 minutes, message us on WhatsApp with your order details and we will resend it."],
    ["privacy", "Privacy Policy", "We collect only your email, WhatsApp number and optional Telegram handle to deliver your purchase and support you. We never sell your data. Payment details are handled by our payment provider and are not stored by us."],
    ["terms", "Terms and Conditions", "Prompts are licensed for your personal or business use. You may not resell, redistribute or publish the prompt text as your own product. Results vary by AI model and settings."],
    ["refund", "Refund Policy", "Because prompts are digital and delivered instantly, sales are final. If a file is faulty or not as described, contact us within 7 days and we will fix it or refund you."]],
  co: { title: "Checkout", btn: "Place Order", waPh: "+233 500000000 / 0200000000" },
  pay: [
    { id: "paystack", type: "paystack", on: false, label: "Paystack Checkout Portal (Mobile Money / Cards)", sub: "Coming soon", key: "", note: "" },
    { id: "transfer", type: "manual", on: true, label: "Direct Account Transfer (Manual Processing)", sub: "We confirm manually and send your prompts", key: "", note: "Send your payment to the account shared on WhatsApp, then send your receipt so we can deliver your prompts." }],
};
export const demoProducts = () => Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, slug: `prompt-title-${i + 1}`, title: `Prompt Title ${i + 1}`, price: 4.99 + (i % 4), old: i % 3 == 0 ? 8.99 : null,
  model: MODELS[i % 6][0], cat: CATS[i % 5][0], trending: i < 8,
  desc: "Product description placeholder. Describe what this pack does, who it is for and how to use it.",
  inside: ["30+ production-ready prompt text templates", "Customisable variables for tone, format and length", "Optimised for advanced prompt engineering"],
  tags: ["prompt engineering", "system prompts"], images: [ph(i, `#${i + 1}`), ph(i + 1, "Preview 2"), ph(i + 2, "Preview 3")],
}));
