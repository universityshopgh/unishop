"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Target, MapPin, Smartphone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/icon.png";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-flyer-light">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#c41e3a_0%,transparent_50%)]" />
                </div>
                <div className="relative z-10 text-center max-w-4xl px-6 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-flyer-red rounded-full text-[10px] font-black uppercase tracking-widest"
                    >
                        Learn Our Story
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter"
                    >
                        University <span className="text-flyer-red italic">Shop</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-300 font-medium italic"
                    >
                        &quot;Affordability at its best!&quot;
                    </motion.p>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Our Mission</h2>
                            <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                Founded on the Kumasi Tanoso Campus, University Shop was born from a simple observation: students and staff deserve premium products at prices that don&apos;t break the bank. We are more than just a marketplace; we are a campus bridge to quality lifestyle and tech essentials.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <Target className="w-10 h-10 text-flyer-red mb-4" />
                                <h3 className="font-black text-slate-900 mb-2">Accessibility</h3>
                                <p className="text-sm text-slate-500 font-medium">Bringing global brands directly to your doorstep on campus.</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <Users className="w-10 h-10 text-flyer-green mb-4" />
                                <h3 className="font-black text-slate-900 mb-2">Community</h3>
                                <p className="text-sm text-slate-500 font-medium">Supporting the AAMUSTED community with local hub support.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-slate-200 rounded-[60px] overflow-hidden shadow-2xl relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-flyer-red/20 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <Image
                                    src={logo}
                                    alt="UniShop Global"
                                    className="object-contain drop-shadow-2xl"
                                    fill
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 z-20 max-w-[240px] flex items-center gap-4">
                            <div className="w-12 h-12 relative flex-shrink-0">
                                <Image src={logo} alt="Logo" fill className="object-contain" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900">100%</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Campus Satisfaction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Campus Hub Section */}
            <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Our Presence</h2>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto">Visit us at any of our hubs for physical inspection and instant pickup.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 text-center space-y-6">
                            <div className="w-16 h-16 bg-flyer-red rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase">Main Hub</h3>
                            <p className="text-slate-400 font-medium">Kumasi Tanoso Campus<br />AAMUSTED Hub A</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 text-center space-y-6">
                            <div className="w-16 h-16 bg-flyer-green rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                <Smartphone className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase">Direct Line</h3>
                            <p className="text-slate-400 font-medium text-xl">0544996944</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 text-center space-y-6">
                            <div className="w-16 h-16 bg-slate-700 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase">Support</h3>
                            <p className="text-slate-400 font-medium">support@unishop.edu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 text-center">
                <div className="max-w-4xl mx-auto px-6 space-y-12">
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900">Ready to Upgrade?</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link
                            href="/shop"
                            className="w-full md:w-auto px-12 py-5 bg-flyer-red text-white font-black rounded-full shadow-2xl hover:scale-105 transition-all text-lg"
                        >
                            Shop Collections
                        </Link>
                        <a
                            href="https://chat.whatsapp.com/FYAY0Z8z5POFwdG6OYCtse?mode=gi_c"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto px-12 py-5 bg-emerald-500 text-white font-black rounded-full hover:bg-emerald-600 transition-all text-lg shadow-xl"
                        >
                            WhatsApp Hub
                        </a>
                        <a
                            href="https://wa.me/233544996944"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 border-2 border-slate-100 font-black rounded-full hover:bg-slate-50 transition-all text-lg"
                        >
                            Talk to Admin
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
