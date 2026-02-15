"use client";

import React from "react";
import { Lock, Eye, ShieldCheck, ChevronRight, Server, Globe, Smartphone, CreditCard } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Eye,
            color: "bg-slate-900",
            title: "Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us. This may include your name, email address, phone number, shipping/billing address, and payment information (processed securely by our partners)."
        },
        {
            icon: Smartphone,
            color: "bg-flyer-blue",
            title: "Usage Data & Tracking",
            content: "When you access our platform, we may automatically collect certain information about your device and usage, including your IP address, browser type, operating system, and interaction data. We use this to improve our services and ensure platform security."
        },
        {
            icon: Server,
            color: "bg-flyer-navy",
            title: "How We Use Information",
            content: "We use your improved data to process transactions, send order confirmations, provide customer support, and detect fraud. We may also use your information to communicate with you about products, services, offers, and promotions."
        },
        {
            icon: CreditCard,
            color: "bg-flyer-green",
            title: "Payment Security",
            content: "All financial transactions are handled by our secure payment processor, Paystack. We do not store your full credit card information on our servers. Transactions are encrypted using industry-standard SSL technology."
        },
        {
            icon: Globe,
            color: "bg-flyer-red",
            title: "Information Sharing",
            content: "We do not sell your personal information. We may share information with third-party vendors who provide services on our behalf (e.g., shipping carriers, payment processors) strictly for the purpose of fulfilling your orders."
        },
        {
            icon: ShieldCheck,
            color: "bg-emerald-600",
            title: "Your Rights & Choices",
            content: "You have the right to access, correct, or delete your personal information. You can manage your communication preferences in your account settings. Contact our support team for any data-related requests."
        }
    ];

    return (
        <div className="min-h-screen bg-flyer-light pt-32 pb-24 relative overflow-hidden">
            {/* Background Accents (reused from Login/Register for consistency) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flyer-green rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="space-y-4 mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-flyer-green/10 border border-flyer-green/10 rounded-full text-[10px] font-black text-flyer-green uppercase tracking-widest"
                    >
                        Data Protection Protocol
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase italic"
                    >
                        Privacy <span className="text-flyer-green">Policy</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 font-bold uppercase tracking-widest text-xs"
                    >
                        Effective Date: February 2026
                    </motion.p>
                </div>

                <div className="grid gap-8">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-flyer-green/20 hover:shadow-2xl hover:shadow-flyer-green/5 transition-all duration-500 group"
                        >
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                <div className={`shrink-0 w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <section.icon className="w-7 h-7" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-flyer-green transition-colors">
                                        {section.title}
                                    </h2>
                                    <p className="text-slate-600 font-medium leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-block p-8 bg-white rounded-[40px] shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 uppercase mb-4">Questions about your data?</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Our data protection officer is available to address any concerns regarding our privacy practices.
                        </p>
                        <Link
                            href="mailto:privacy@unishop.com"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-flyer-green transition-colors uppercase tracking-widest text-xs shadow-lg shadow-slate-900/20 hover:shadow-flyer-green/30"
                        >
                            Contact Privacy Team <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
