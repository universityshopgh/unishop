"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { getDiscountedPrice } from "@/lib/promoUtils";
import { Star, ShoppingCart, ArrowRight, Heart } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart, isPromoActive, promoConfig } = useCart();

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-[40px] overflow-hidden relative shadow-sm border border-slate-50 hover:border-flyer-red/20 transition-all duration-500"
        >
            <Link href={`/shop/${product.id}`} className="block relative h-56 overflow-hidden bg-white group-hover:bg-slate-50 transition-colors">
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <Image
                        src={(product.images && product.images[0]) ? product.images[0] : "https://via.placeholder.com/400x400?text=No+Image"}
                        alt={product.name}
                        fill
                        className="object-contain transition-all duration-700 p-4"
                        unoptimized={product.images && product.images[0]?.startsWith('/')}
                    />
                </div>

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                    <div className="w-full bg-white text-slate-900 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                        Explore Product
                        <ArrowRight className="w-4 h-4 text-flyer-red" />
                    </div>
                </div>

                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100">
                        {product.category}
                    </span>
                    {product.stock < 10 && (
                        <span className="px-4 py-1.5 rounded-full bg-flyer-red text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-flyer-red/20">
                            Limited Stock
                        </span>
                    )}
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                    )}
                    {isPromoActive && (
                        <span className="px-4 py-1.5 rounded-full bg-flyer-red text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-flyer-red/20 flex items-center gap-2">
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            {promoConfig.name}
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-flyer-red transition-colors uppercase tracking-tighter italic">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                            <span className="text-[9px] font-black text-slate-400 ml-2 uppercase tracking-widest leading-none">4.9</span>
                        </div>
                        {isPromoActive && (
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Best Price
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex flex-col gap-3">
                        {/* 1. Original Price & Label */}
                        {(isPromoActive || (product.originalPrice && product.originalPrice > product.price)) && (
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">List Price:</span>
                                <del className="text-base font-bold text-slate-200 no-underline line-through decoration-flyer-red/20 italic">
                                    ₵{(product.originalPrice || product.price).toFixed(2)}
                                </del>
                            </div>
                        )}

                        <div className="flex flex-col gap-1 relative">
                            {/* 2. Final Price (You Pay) */}
                            <div className="flex flex-col">
                                {product.variants && product.variants.length > 0 && (
                                    <span className="text-[9px] font-black uppercase text-slate-400 not-italic block -mb-1">Starting at</span>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter italic flex items-start">
                                        <span className="text-lg text-flyer-red mt-1 mr-1 not-italic font-bold">₵</span>
                                        {(isPromoActive
                                            ? getDiscountedPrice(product.variants && product.variants.length > 0 ? Math.min(...product.variants.map(v => v.price)) : product.price, promoConfig)
                                            : (product.variants && product.variants.length > 0 ? Math.min(...product.variants.map(v => v.price)) : product.price)
                                        ).toFixed(2)}
                                    </div>
                                    <div className="flex flex-col">
                                        {isPromoActive && (
                                            <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-flyer-red text-white uppercase tracking-tighter w-fit mb-0.5 shadow-sm">
                                                -{promoConfig.discountPercent}%
                                            </span>
                                        )}
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-slate-900/5 text-slate-500 uppercase tracking-widest whitespace-nowrap border border-slate-100 italic">
                                            Pay
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="w-full h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center gap-3 hover:bg-flyer-red transition-all duration-300 group/btn shadow-xl shadow-slate-200 hover:shadow-flyer-red/20 active:scale-95 group/main overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Add to Cart</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
