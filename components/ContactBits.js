"use client";
import { useEffect, useRef } from "react";
import { useCfg, useCart } from "./Providers";

export function OpenHash() {
  useEffect(() => { const h = location.hash.slice(1); if (/^[a-z]+\$/.test(h)) { const el = document.getElementById(h); if (el) { el.open = true; el.scrollIntoView(); } } }, []);
  return null;
}

export function ContactForm() {
  const cfg = useCfg(), { toast } = useCart(), last = useRef(0);

  // 1. Dynamically load the Google reCAPTCHA script on the client side
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = "https://google.com";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const submit = (e) => {
    e.preventDefault(); 
    const f = Object.fromEntries(new FormData(e.target)); 
    
    // Honeypot anti-spam check
    if (f.website) return;
    
    // Rate limit check
    if (Date.now() - last.current < 3e4) return toast("Please wait a moment before trying again");
    
    // Input format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}\$/.test(f.e) || f.m.length > 1000) return toast("Check your email and message");
    
    // 2. Validate that the user actually clicked the reCAPTCHA checkbox
    const recaptchaResponse = window.grecaptcha?.getResponse();
    if (!recaptchaResponse) {
      return toast("Please check the 'I'm not a robot' box");
    }

    last.current = Date.now();
    
    // 3. Reset the CAPTCHA widget for the next submission attempt
    window.grecaptcha.reset();

    open(`https://wa.me/${cfg.waIntl}?text=${encodeURIComponent(`Hi, I'm \${f.n.slice(0, 60)} (f.e). {f.m}`)}`, "_blank", "noopener");
  };

  return (
    <form onSubmit={submit} className="md:col-span-3 space-y-4">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <input className="inp" name="n" placeholder="Your name" required maxLength={60} />
      <input className="inp" type="email" name="e" placeholder="Email address" required maxLength={120} />
      <textarea className="inp" name="m" rows={5} placeholder="How can we help?" required maxLength={1000} />
      
      {/* 4. This container displays your Google reCAPTCHA v2 check box */}
      <div 
        className="g-recaptcha" 
        data-sitekey="6Lee1NktAAAAAG6Mhh-yriMvBs_UfSfO03IMpXah"
      ></div>

      <button className="slide bg-crim text-white font-bold px-8 py-3.5 rounded-full">
        Send via WhatsApp
      </button>
    </form>
  );
}
