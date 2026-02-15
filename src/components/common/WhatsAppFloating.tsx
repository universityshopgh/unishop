"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WhatsAppFloating = () => {
    const whatsappLink = "https://chat.whatsapp.com/FYAY0Z8z5POFwdG6OYCtse?mode=gi_c";

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-64 right-0 z-[99999] pointer-events-auto group"
        >
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-emerald-600/95 backdrop-blur-md text-white pl-4 pr-5 py-2.5 rounded-l-2xl shadow-[0_15px_40px_-10px_rgba(5,150,105,0.4)] border-y border-l border-white/10 transition-all hover:bg-emerald-500"
            >
                <div className="w-9 h-9 bg-white flex items-center justify-center rounded-xl shadow-lg group-hover:rotate-6 transition-transform duration-500">
                    <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-600/5" />
                </div>
                <div className="flex flex-col -space-y-0.5">
                    <span className="text-[7.5px] font-black uppercase tracking-[0.2em] opacity-60 italic">Support</span>
                    <span className="text-[11px] font-black uppercase tracking-tighter italic">HUB</span>
                </div>
            </a>
            <div className="absolute top-0 right-0 w-0.5 h-full bg-emerald-400 opacity-50" />
        </motion.div>
    );
};

export default WhatsAppFloating;
