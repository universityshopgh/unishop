"use client";

import React, { useState } from "react";
import { MessageCircle, Mail, MapPin, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    return (
        <div className="min-h-screen bg-flyer-light pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-flyer-red/10 border border-flyer-red/10 rounded-full text-[10px] font-black text-flyer-red uppercase tracking-widest">
                                Hub Support
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">Get in <span className="text-flyer-red">Touch</span></h1>
                            <p className="text-lg text-slate-500 font-medium max-w-md">Our team is active across campus to help you secure the best gear. Reach us through any channel below.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 space-y-4 group hover:border-flyer-red/20 transition-all">
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight">WhatsApp</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hub: 0591634650</p>
                                <a href="https://wa.me/233591634650" className="inline-flex items-center gap-2 text-[10px] font-black text-flyer-red uppercase tracking-widest pt-2">
                                    Open Chat <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 space-y-4 group hover:border-flyer-red/20 transition-all">
                                <div className="w-12 h-12 bg-flyer-red rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight">Email Support</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">universityshop845@gmail.com</p>
                                <a href="mailto:universityshop845@gmail.com" className="inline-flex items-center gap-2 text-[10px] font-black text-flyer-red uppercase tracking-widest pt-2">
                                    Send Email <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[50px] text-white space-y-6 relative overflow-hidden group">
                            <MapPin className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Campus Location</h3>
                            <div className="space-y-4 relative z-10">
                                <p className="text-slate-400 text-sm font-medium">AAMUSTED Hub A, Main Campus Terminal,<br />Tanoso - Kumasi, Ghana</p>
                                <div className="flex items-center gap-3 text-flyer-green">
                                    <div className="w-2 h-2 rounded-full bg-flyer-green animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open: 8AM - 8PM Daily</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-50 space-y-8 relative overflow-hidden">
                        <AnimatePresence>
                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-24 h-24 bg-flyer-green rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-8">
                                        <ShieldCheck className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Message Dispatched!</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-10">Our Campus Hub team will reach out to you within 2-4 business hours.</p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px]"
                                    >
                                        New Inquiry
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Quick Inquiry</h2>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Instant Platform Feedback</p>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSubmitted(false);
                            // setLoading(true); // TODO: Add loading state if needed

                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const name = formData.get('name');
                            const acquisitionId = formData.get('acquisitionId');
                            const message = formData.get('message');

                            try {
                                const res = await fetch('/api/contact', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name, acquisitionId, message })
                                });

                                if (res.ok) {
                                    setIsSubmitted(true);
                                    form.reset();
                                } else {
                                    alert("Failed to send message. Please try again.");
                                }
                            } catch (err) {
                                console.error(err);
                                alert("Something went wrong.");
                            }
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                <input name="name" required type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-3xl p-5 focus:outline-none focus:border-flyer-red/20 text-slate-900 font-bold text-sm" placeholder="Hub User" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Acquisition ID (Optional)</label>
                                <input name="acquisitionId" type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-3xl p-5 focus:outline-none focus:border-flyer-red/20 text-slate-900 font-bold text-sm" placeholder="UNI-XXXXXX" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your Message</label>
                                <textarea name="message" required rows={4} className="w-full bg-slate-50 border-2 border-transparent rounded-3xl p-5 focus:outline-none focus:border-flyer-red/20 text-slate-900 font-bold text-sm resize-none" placeholder="How can the Hub help you?" />
                            </div>
                            <button type="submit" className="w-full h-20 bg-flyer-red text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-flyer-red/20 hover:scale-[1.02] active:scale-95 transition-all text-xs">
                                Dispatch Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
