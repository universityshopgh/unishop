"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function TrackPage() {
    const [orderId, setOrderId] = useState("");
    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderId.trim()) {
            router.push(`/track/${orderId.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-flyer-light pt-32 pb-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-900/5 -rotate-12 translate-x-1/2 rounded-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-flyer-red/5 rotate-12 -translate-x-1/2 rounded-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                            <Package className="w-4 h-4 text-flyer-red" />
                            Live Hub Logistics
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                            Track Your <br />
                            <span className="text-flyer-red">Hub Gear</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm max-w-xl mx-auto">
                            Enter your Hub-Receipt ID or individual <span className="text-flyer-red">Item Tracking ID</span> to get real-time status on your package security.
                        </p>
                    </motion.div>

                    {/* Search Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-4 md:p-8 rounded-[50px] shadow-2xl shadow-slate-200 border border-slate-50 mt-12"
                    >
                        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-hover:text-flyer-red transition-colors" />
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="Enter Order or Item ID (HUB-...)"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white h-20 md:h-24 px-20 rounded-[2.5rem] text-xl font-black text-slate-900 placeholder:text-slate-300 transition-all outline-none italic tracking-tight"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="h-20 md:h-24 px-12 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-4"
                            >
                                Track Now
                                <ArrowRight className="w-6 h-6 text-flyer-red" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Quick Help */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12"
                    >
                        <div className="p-8 rounded-[40px] bg-white border border-slate-50 flex items-start gap-6 text-left group hover:border-flyer-red/20 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-flyer-red/5 flex items-center justify-center group-hover:bg-flyer-red group-hover:text-white transition-all shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 uppercase italic text-lg leading-tight mb-2">Secure Routing</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Every package is verified at 3 Hub checkpoints before final dispatch.</p>
                            </div>
                        </div>
                        <div className="p-8 rounded-[40px] bg-white border border-slate-50 flex items-start gap-6 text-left group hover:border-flyer-red/20 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 uppercase italic text-lg leading-tight mb-2">Need Support?</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Can't find your ID? Contact the Hub Commander via WhatsApp instantly.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="pt-16">
                        <Link href="/profile" className="text-[10px] font-black text-slate-300 hover:text-flyer-red transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Back to Hub Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
