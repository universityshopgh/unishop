import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import siteConfig from "@/config/site-config.json";

const Footer = () => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;

        if (!email) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "subscribers"), {
                email,
                source: "footer_newsletter",
                subscribedAt: serverTimestamp(),
                status: "active"
            });
            alert("Hub Protocol: Subscription Successful!");
            form.reset();
        } catch (error) {
            console.error("Newsletter error:", error);
            alert("Hub Error: Security handshake failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer className="bg-zinc-950 border-t border-white/5 pt-16 md:pt-24 pb-12 px-6 lg:px-12 overflow-hidden">
            <div className="max-w-[1440px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-16 md:pb-20 border-b border-white/5">
                    {/* Brand Section */}
                    <div className="space-y-6 md:space-y-8">
                        <Link href="/" className="inline-block group">
                            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter transition-all group-hover:-rotate-2">
                                <span className="text-white">{siteConfig.brand.name}</span> <span className="text-flyer-red">{siteConfig.brand.suffix}</span>
                            </h2>
                        </Link>
                        <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs font-black italic opacity-80">
                            {siteConfig.brand.tagline} <br />
                            {siteConfig.brand.description}
                        </p>
                        <div className="flex gap-4 pt-2">
                            {siteConfig.socials.map((social, idx) => (
                                <Link
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white ${social.color} transition-all duration-500 hover:scale-110 active:scale-95 border border-white/5 hover:border-white/10`}
                                >
                                    {social.icon === "Facebook" && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>}
                                    {social.icon === "Instagram" && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>}
                                    {social.icon === "Tiktok" && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Explore Links */}
                    <div className="sm:pt-4 md:pt-0">
                        <Link href="/shop" className="group">
                            <h4 className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 md:mb-10 italic group-hover:text-flyer-red transition-colors">Explore</h4>
                        </Link>
                        <ul className="space-y-4 md:space-y-5">
                            {siteConfig.navigation.explore.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-zinc-500 hover:text-white text-xs md:text-[13px] font-black transition-all block italic hover:translate-x-1 decoration-flyer-red hover:underline underline-offset-4 decoration-2">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="sm:pt-4 md:pt-0">
                        <h4 className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 md:mb-10 italic">Support</h4>
                        <ul className="space-y-4 md:space-y-5">
                            {siteConfig.navigation.support.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-zinc-500 hover:text-white text-xs md:text-[13px] font-black transition-all block italic hover:translate-x-1 decoration-flyer-red hover:underline underline-offset-4 decoration-2">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-2">
                            <h4 className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic">Stay Updated</h4>
                            <p className="text-zinc-500 text-[10px] md:text-xs font-black italic">Subscribe for drop alerts & special offers.</p>
                        </div>
                        <form onSubmit={handleSubscribe} className="relative group overflow-hidden rounded-2xl border border-white/5 focus-within:border-flyer-red/30 transition-all shadow-2xl">
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="DROP EMAIL HERE"
                                disabled={submitting}
                                className="w-full bg-white/5 px-5 md:px-6 py-4 md:py-5 text-[10px] md:text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:bg-white/10 transition-all font-black uppercase tracking-tighter"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="absolute right-2 top-2 bottom-2 md:right-3 md:top-3 md:bottom-3 bg-white text-black text-[9px] md:text-[10px] font-black px-4 md:px-6 rounded-xl hover:bg-flyer-red hover:text-white transition-all disabled:opacity-50"
                            >
                                {submitting ? "..." : "JOIN"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar Section */}
                <div className="mt-10 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-left">
                    <div className="space-y-1">
                        <p className="text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] italic">
                            © {new Date().getFullYear()} {siteConfig.siteMeta.copyrightName}. ALL RIGHTS RESERVED.
                        </p>
                        <p className="text-zinc-800 text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] italic">
                            SECURE ACCESS PROTOCOL // {siteConfig.siteMeta.protocol}
                        </p>
                    </div>

                    <div className="flex gap-6 md:gap-8">
                        <Link href="/terms" className="text-zinc-800 hover:text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors tracking-[0.2em]">Terms</Link>
                        <Link href="/privacy" className="text-zinc-800 hover:text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors tracking-[0.2em]">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
