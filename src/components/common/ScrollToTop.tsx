"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 50 }}
                    className="fixed bottom-12 right-6 md:right-12 z-[99998]"
                >
                    <button
                        onClick={scrollToTop}
                        className="group relative flex items-center justify-center w-14 h-14 bg-white text-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:bg-flyer-red hover:text-white transition-all duration-500 border border-slate-100/50 backdrop-blur-sm"
                    >
                        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-500" />

                        {/* Tooltip */}
                        <div className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                            Back to Top
                        </div>

                        {/* Animated Glow */}
                        <div className="absolute inset-0 rounded-2xl bg-flyer-red/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
