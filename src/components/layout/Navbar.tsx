"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/icon.png";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Search, Menu, X, ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/context/ConfigContext";

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode, onClick?: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className="text-[10px] lg:text-[11px] font-black text-slate-400 hover:text-flyer-red uppercase tracking-[0.2em] transition-colors relative group"
    >
        {children}
        <span className="absolute -bottom-2 left-0 w-0 h-[3px] bg-flyer-red group-hover:w-full transition-all duration-300 rounded-full" />
    </Link>
);

const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode, onClick: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className="block text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 hover:text-flyer-red transition-colors uppercase italic"
    >
        {children}
    </Link>
);

const Navbar = () => {
    const { config } = useConfig();
    const { user, profile, isAdmin } = useAuth();
    const { totalItems, promoConfig, isPromoActive } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {isPromoActive && (
                <div className="bg-flyer-red text-white py-1.5 md:py-2 px-4 shadow-lg shadow-flyer-red/20 relative z-[60]">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-3">
                        <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current animate-pulse shrink-0" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">
                            {promoConfig.name}: {promoConfig.discountPercent}% OFF STOREWIDE • ENDS MARCH 14TH
                        </span>
                        <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current animate-pulse shrink-0" />
                    </div>
                </div>
            )}
            <nav className={`transition-all duration-500 ${isScrolled ? "py-2 md:py-3" : "py-4 md:py-5"}`}>
                <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                    <div className={`rounded-2xl md:rounded-3xl px-4 md:px-6 py-2 md:py-2.5 flex items-center justify-between transition-all duration-500 border ${isScrolled
                        ? "bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200 border-slate-100"
                        : "bg-white border-transparent shadow-sm"
                        }`}>
                        {/* Logo - Flyer Style */}
                        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_50px_rgba(239,68,68,0.2)] group-hover:-translate-y-1 group-hover:rotate-3 transition-all duration-700 bg-gradient-to-br from-white to-slate-50 border border-slate-100 p-1 md:p-1.5 ring-2 ring-slate-900/5 ring-offset-2 ring-offset-white">
                                <Image
                                    src={logo}
                                    alt={`${config?.brand.name || "University"} ${config?.brand.suffix || "Shop"}`}
                                    fill
                                    className="object-contain p-0.5 group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="flex flex-col -space-y-0.5 md:-space-y-1">
                                <span className="text-lg md:text-xl font-black italic tracking-tighter text-slate-900 leading-none">
                                    {config?.brand.name || "University"} <span className="text-flyer-red">{config?.brand.suffix || "Shop"}</span>
                                </span>
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400">Institutional Hub</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
                            {(config?.navigation.main || []).map((link, idx) => (
                                <NavLink key={idx} href={link.href}>{link.label}</NavLink>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-0.5 md:p-1">
                                <button
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className="p-2 md:p-2.5 text-slate-400 hover:text-flyer-red hover:bg-white rounded-lg md:rounded-xl transition-all"
                                >
                                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <Link href="/cart" className="relative p-2 md:p-2.5 text-slate-400 hover:text-flyer-red hover:bg-white rounded-lg md:rounded-xl transition-all group/cart">
                                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-flyer-red text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center text-white ring-2 md:ring-4 ring-white">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            <div className="hidden sm:block h-6 md:h-8 w-[1px] bg-slate-100 mx-1 md:mx-2" />

                            {user ? (
                                <Link href="/profile" className="flex items-center gap-2 md:gap-3 p-0.5 md:p-1 pr-3 md:pr-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-slate-200 flex items-center justify-center text-[10px] md:text-xs font-black uppercase overflow-hidden text-slate-600 relative">
                                        {profile?.photoURL ? (
                                            <Image
                                                src={profile.photoURL}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            profile?.displayName?.[0] || 'U'
                                        )}
                                    </div>
                                    <span className="hidden xs:inline text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest">Account</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-block px-6 md:px-8 py-2.5 md:py-3 bg-flyer-red text-white text-[10px] md:text-xs font-black rounded-lg md:rounded-xl hover:scale-105 transition-all shadow-xl shadow-flyer-red/20 uppercase tracking-widest active:scale-95"
                                >
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 md:p-2.5 bg-slate-50 rounded-lg md:rounded-xl border border-slate-100 text-slate-900"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-20 md:top-24 left-4 right-4 z-40 lg:hidden"
                        >
                            <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl border border-slate-100">
                                <div className="space-y-3 md:space-y-4">
                                    {(config?.navigation.main || []).map((link, idx) => (
                                        <MobileNavLink key={idx} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                                            {link.label}
                                        </MobileNavLink>
                                    ))}
                                    <MobileNavLink href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                                        Cart ({totalItems})
                                    </MobileNavLink>
                                </div>

                                {!user && (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center w-full py-4 md:py-5 bg-flyer-red text-white font-black rounded-2xl md:rounded-3xl uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-flyer-red/20"
                                    >
                                        Get Started
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[60] flex items-center justify-center p-6"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                                    <input
                                        autoFocus
                                        placeholder="Search products, brands..."
                                        className="w-full bg-white border-4 border-slate-100 rounded-[32px] py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-flyer-red/20 transition-all font-bold text-slate-900"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                window.location.href = `/shop?q=${encodeURIComponent(e.currentTarget.value)}`;
                                                setIsSearchOpen(false);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.querySelector('input[placeholder="Search products, brands..."]') as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                                window.location.href = `/shop?q=${encodeURIComponent(input.value)}`;
                                                setIsSearchOpen(false);
                                            } else {
                                                setIsSearchOpen(false);
                                            }
                                        }}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;
