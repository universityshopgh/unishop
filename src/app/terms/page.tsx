"use client";

import React from "react";
import { Shield, Lock, FileText, ChevronRight, Truck, RefreshCw, AlertTriangle, Scale } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
    const sections = [
        {
            icon: FileText,
            color: "bg-slate-900",
            title: "Agreement to Terms",
            content: "By accessing or using University Shop, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
        },
        {
            icon: Shield,
            color: "bg-flyer-red",
            title: "Account Responsibilities",
            content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. We reserve the right to terminate accounts, remove or edit content, or cancel orders at our sole discretion."
        },
        {
            icon: Lock,
            color: "bg-flyer-green",
            title: "Transactions & Payments",
            content: "All purchases are subject to product availability. We reserve the right to refuse or cancel any order for any reason, including errors in pricing or product information. Payment must be completed via our authorized gateways (Paystack, Mobile Money) before order processing begins."
        },
        {
            icon: Truck,
            color: "bg-flyer-blue",
            title: "Shipping & Delivery",
            content: "Delivery times are estimates and cannot be guaranteed. We are not liable for delays caused by third-party carriers or unforeseen circumstances. All items are shipped pursuant to a shipment contract; the risk of loss and title for such items pass to you upon our delivery to the carrier."
        },
        {
            icon: RefreshCw,
            color: "bg-orange-500",
            title: "Returns & Refunds",
            content: "Eligible items may be returned within 7 days of delivery for a refund or exchange, provided they are in original condition. Digital products, personalized items, and perishable goods are non-refundable unless defective. Return shipping costs are the responsibility of the customer unless the return is due to our error."
        },
        {
            icon: AlertTriangle,
            color: "bg-flyer-navy",
            title: "Limitation of Liability",
            content: "University Shop shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the services or any content on the services."
        },
        {
            icon: Scale,
            color: "bg-emerald-600",
            title: "Governing Law",
            content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which University Shop operates. You irrevocably submit to the exclusive jurisdiction of the courts in that location."
        }
    ];

    return (
        <div className="min-h-screen bg-flyer-light pt-32 pb-24 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flyer-green rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="space-y-4 mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-flyer-red/10 border border-flyer-red/10 rounded-full text-[10px] font-black text-flyer-red uppercase tracking-widest"
                    >
                        Legal Framework
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase italic"
                    >
                        Terms of <span className="text-flyer-red">Service</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 font-bold uppercase tracking-widest text-xs"
                    >
                        Last Updated: February 2026
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
                            className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-flyer-red/20 hover:shadow-2xl hover:shadow-flyer-red/5 transition-all duration-500 group"
                        >
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                <div className={`shrink-0 w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <section.icon className="w-7 h-7" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-flyer-red transition-colors">
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
                        <h3 className="text-xl font-black text-slate-900 uppercase mb-4">Need clarification?</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Our legal team is available to explain any part of these terms in simpler language.
                        </p>
                        <Link
                            href="mailto:legal@unishop.com"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-flyer-red transition-colors uppercase tracking-widest text-xs shadow-lg shadow-slate-900/20 hover:shadow-flyer-red/30"
                        >
                            Contact Legal Support <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
