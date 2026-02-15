"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, grandTotal, isPromoActive, getPromoDiscountAmount, promoConfig, selectedDiscountType } = useCart();
    const { isAdmin } = useAuth();
    const router = useRouter();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-flyer-light flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_120%,#c41e3a0a_0%,transparent_50%)]">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center space-y-8"
                >
                    <div className="w-32 h-32 rounded-[3rem] bg-white shadow-2xl flex items-center justify-center border-4 border-slate-50 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-flyer-red opacity-0 group-hover:opacity-5 transition-opacity" />
                        <ShoppingCart className="w-12 h-12 text-slate-200 group-hover:text-flyer-red transition-colors group-hover:scale-110 duration-500" />
                    </div>
                    <div className="text-center space-y-4 max-w-sm">
                        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Your Bag is Empty</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed">The campus hub is waiting. Explore the latest drops and essentials curated for you.</p>
                    </div>
                    <Link
                        href="/shop"
                        className="bg-flyer-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-flyer-red/30 hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
                    >
                        Start Exploring
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-flyer-light min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Cart Items */}
                    <div className="flex-grow space-y-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2">
                                <span className="w-8 h-1 bg-flyer-red rounded-full" />
                                <p className="text-[10px] font-black text-flyer-red uppercase tracking-[0.3em]">Shopping Bag</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">Your Selection</h1>
                                <span className="px-5 py-2 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm">{totalItems} Verified Items</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence>
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.productId}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-10 shadow-sm border border-slate-50 group hover:border-flyer-red/10 transition-all duration-500"
                                    >
                                        <div className="relative w-36 h-36 rounded-[2rem] overflow-hidden flex-shrink-0 bg-slate-50 border-4 border-white shadow-xl">
                                            <Image
                                                src={item.image || "/images/placeholder.png"}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-4 group-hover:scale-110 transition-all duration-700"
                                                unoptimized={item.image?.startsWith('/')}
                                            />
                                        </div>

                                        <div className="flex-grow text-center md:text-left space-y-2">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                                <p className="text-[10px] font-black text-flyer-green uppercase tracking-[0.2em]">Authentic Gear</p>
                                                <span className="hidden md:block w-1 h-1 bg-slate-200 rounded-full" />
                                                <p className="text-[10px] font-black text-flyer-red uppercase tracking-[0.2em]">{item.trackingId}</p>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">{item.name}</h3>
                                            <div className="flex items-center justify-center md:justify-start gap-4">
                                                <p className="text-2xl font-black text-flyer-red italic tracking-tighter">₵ {item.price}</p>
                                                <div className="h-4 w-[1px] bg-slate-100" />
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">In Stock Hub A</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-1 flex items-center shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-slate-400 hover:text-flyer-red"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center text-lg font-black text-slate-900 italic tracking-tighter">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-slate-400 hover:text-flyer-red"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 hover:text-flyer-red hover:bg-flyer-red/5 hover:border-flyer-red/10 border border-transparent transition-all group/trash"
                                            >
                                                <Trash2 className="w-6 h-6 group-hover/trash:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Link href="/shop" className="inline-flex items-center gap-4 text-slate-400 text-xs font-black uppercase tracking-[0.3em] hover:text-flyer-red transition-colors group py-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            </div>
                            Continue Exploring the Hub
                        </Link>
                    </div>

                    {/* Summary - Flyer Style Floating Panel */}
                    <div className="w-full lg:w-[420px] lg:sticky lg:top-32">
                        <div className="bg-white p-12 rounded-[50px] shadow-2xl shadow-slate-200 border border-slate-50 space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-flyer-red/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl pointer-events-none" />

                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Hub Summary</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Clearance</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Subtotal</span>
                                    <span className="text-2xl font-black text-slate-900 italic tracking-tighter">₵ {totalPrice.toFixed(2)}</span>
                                </div>
                                {isPromoActive && selectedDiscountType === 'promo' && (
                                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100 text-flyer-red">
                                        <span className="text-xs font-black uppercase tracking-widest">{promoConfig.name}</span>
                                        <span className="text-xl font-black italic tracking-tighter">- ₵ {getPromoDiscountAmount().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-xl font-black uppercase tracking-tighter italic text-slate-900">Final Total</span>
                                    <span className="text-5xl font-black text-flyer-red italic tracking-tighter leading-none">₵ {grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => !isAdmin && router.push("/checkout")}
                                    disabled={isAdmin}
                                    className={`w-full h-24 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl ${isAdmin
                                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border-2 border-slate-50"
                                        : "bg-slate-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95 shadow-slate-900/20"
                                        }`}
                                >
                                    {isAdmin ? "Admin Protocol: Pay Restricted" : "Verify & Purchase"}
                                    <ArrowRight className={`w-6 h-6 ${isAdmin ? "text-slate-200" : "text-flyer-red"}`} />
                                </button>

                                <div className="flex items-center justify-center gap-3 py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-flyer-green" />
                                    University Shop Secure Payment Guarantee
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-8 opacity-20 filter grayscale">
                                <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
                                <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
                                <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
