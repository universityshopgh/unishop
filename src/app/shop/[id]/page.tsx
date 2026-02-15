"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ProductVariant } from "@/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, Heart, Shield, Truck, RotateCcw, CheckCircle2, ChevronRight, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams as useNextSearchParams } from "next/navigation";
import { getDiscountedPrice } from "@/lib/promoUtils";

export default function ProductDetailPage() {
    const { id } = useParams();
    const searchParams = useNextSearchParams();
    const variantId = searchParams.get("v");

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const { addToCart, isPromoActive: isPromoActiveNow, promoConfig } = useCart();
    const { isAdmin } = useAuth();
    const router = useRouter();

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPosition({ x, y });
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "products", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as Product;
                    setProduct(data);

                    // Handle variant from query param or initial
                    if (data.variants && data.variants.length > 0) {
                        const targetVariant = variantId
                            ? data.variants.find(v => v.id === variantId)
                            : data.variants[0];

                        if (targetVariant) {
                            setActiveVariant(targetVariant);
                            const imgIdx = data.images.findIndex(img => img === targetVariant.image);
                            if (imgIdx !== -1) setSelectedImage(imgIdx);
                        }
                    }
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, variantId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-flyer-red"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-flyer-light p-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <Shield className="w-10 h-10 text-slate-200" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 uppercase italic">Product Missing</h2>
                <Link href="/shop" className="px-10 py-5 bg-flyer-red text-white font-black rounded-full shadow-2xl shadow-flyer-red/20 uppercase tracking-widest text-xs">Return to Shop</Link>
            </div>
        );
    }

    const basePrice = activeVariant ? activeVariant.price : product.price;
    const currentPrice = isPromoActiveNow ? getDiscountedPrice(basePrice, promoConfig) : basePrice;
    const currentName = activeVariant ? activeVariant.name : product.name;

    const handleAddToCart = () => {
        if (isAdmin || !product) return;

        // Create a specialized product object for the cart based on current selection
        const cartProduct = {
            ...product,
            name: activeVariant ? `${product.name} - ${activeVariant.name}` : product.name,
            price: currentPrice,
            images: [product.images[selectedImage], ...product.images.filter((_, i) => i !== selectedImage)]
        };

        addToCart(cartProduct, quantity);
    };

    return (
        <div className="min-h-screen bg-flyer-light pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-flyer-red transition-colors mb-12 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Back to Selection
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                    {/* Gallery - Unclustered Professional Vertical Stack */}
                    <div className="lg:col-span-7 space-y-12 order-2 lg:order-1">
                        {product.images.map((img, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="aspect-square relative rounded-[40px] md:rounded-[60px] overflow-hidden bg-white shadow-2xl shadow-slate-200 border-[12px] md:border-[20px] border-white group"
                                onClick={() => {
                                    setSelectedImage(idx);
                                    setShowLightbox(true);
                                }}
                            >
                                <Image
                                    src={img}
                                    alt={`${product.name} View ${idx + 1}`}
                                    fill
                                    className="object-contain p-8 md:p-16 transition-transform duration-1000 group-hover:scale-105"
                                    unoptimized={img?.startsWith('/')}
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors cursor-zoom-in flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 flex items-center justify-center">
                                        <Maximize2 className="w-6 h-6 text-slate-900" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Product Metadata & Action Section - Sticky on Desktop */}
                    <div className="lg:col-span-5 space-y-12 order-1 lg:order-2 lg:sticky lg:top-32">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                {isPromoActiveNow && (
                                    <span className="px-5 py-2 rounded-full bg-flyer-red text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-flyer-red/20 flex items-center gap-2">
                                        <Heart className="w-3 h-3 fill-current animate-pulse" />
                                        {promoConfig.name}
                                    </span>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="px-5 py-2 rounded-full bg-flyer-red/10 text-flyer-red text-[11px] font-black tracking-widest uppercase border border-flyer-red/5">
                                        {product.category}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5" />
                                        Authentic Hub Serial
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/10">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-[11px] font-black text-amber-600">4.8</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase italic transition-all">{currentName}</h1>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Authentic Gear • Hub Verified</p>
                            </div>

                            <div className="pt-4 space-y-8">
                                <div className="flex flex-col gap-6">
                                    {/* 1. Original Price (Strikethrough) */}
                                    {(isPromoActiveNow || (product.originalPrice && product.originalPrice > currentPrice)) && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black uppercase text-slate-300 tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Original Price</span>
                                            <p className="text-3xl font-bold text-slate-200 line-through decoration-flyer-red/30 italic">
                                                ₵{(product.originalPrice || basePrice).toFixed(2)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-end gap-10">
                                        <div className="flex flex-col gap-4">
                                            {/* 2. Discount Badge */}
                                            {isPromoActiveNow && (
                                                <div className="flex items-center gap-2 bg-flyer-red text-white w-fit px-4 py-1.5 rounded-full shadow-lg shadow-flyer-red/20 scale-110 origin-left">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">-{promoConfig.discountPercent}% SEASONAL DISCOUNT APPLIED</span>
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                    >
                                                        <Heart className="w-3 h-3 fill-current" />
                                                    </motion.div>
                                                </div>
                                            )}

                                            {/* 3. Final Price (You Pay) */}
                                            <motion.div
                                                key={currentPrice}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex flex-col"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">You Pay (GHS)</span>
                                                </div>
                                                <div className="text-8xl font-black text-slate-900 italic tracking-tighter flex items-start relative overflow-hidden group py-2">
                                                    <span className="text-4xl text-flyer-red mt-4 mr-2 not-italic">₵</span>
                                                    {currentPrice.toFixed(2)}
                                                    {isPromoActiveNow && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-flyer-red/0 via-flyer-red/5 to-flyer-red/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Savings Breakdown */}
                                        {isPromoActiveNow && (
                                            <div className="bg-emerald-50 border-2 border-emerald-100 px-8 py-5 rounded-[32px] mb-2">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Savings</p>
                                                <p className="text-3xl font-black text-emerald-700 italic tracking-tighter">
                                                    -₵{(basePrice - currentPrice).toFixed(2)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variants Selector - Simplified but Professional */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1 border-l-4 border-flyer-red pl-3">Specifications</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setActiveVariant(variant)}
                                            className={`flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all text-left ${activeVariant?.id === variant.id
                                                ? "border-flyer-red bg-white shadow-xl shadow-flyer-red/5"
                                                : "border-transparent bg-white/50 hover:bg-white hover:border-slate-100"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-white border border-slate-50 flex-shrink-0">
                                                    <Image src={variant.image} alt={variant.name} fill className="object-contain p-1" unoptimized={variant.image?.startsWith('/')} />
                                                </div>
                                                <p className={`font-black uppercase text-sm italic tracking-tight ${activeVariant?.id === variant.id ? "text-slate-900" : "text-slate-400"}`}>{variant.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-lg italic tracking-tighter ${activeVariant?.id === variant.id ? "text-flyer-red" : "text-slate-900"}`}>
                                                    ₵{(isPromoActiveNow ? getDiscountedPrice(variant.price, promoConfig) : variant.price).toFixed(2)}
                                                </p>
                                                {isPromoActiveNow && (
                                                    <p className="text-[10px] font-bold text-slate-300 line-through -mt-1">
                                                        ₵{variant.price.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-8 bg-white rounded-[40px] shadow-sm border border-slate-50 relative overflow-hidden group">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">The Narrative</h3>
                            <p className="text-slate-600 font-bold leading-relaxed text-lg italic mt-4">
                                &quot;{product.description || "Experience the pinnacle of quality and craftsmanship with this exclusive piece, designed to elevate your campus life."}&quot;
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-2 flex items-center shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all font-black text-xl text-slate-400">-</button>
                                    <span className="w-16 text-center font-black text-3xl text-slate-900 italic tracking-tighter">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all font-black text-xl text-slate-400">+</button>
                                </div>
                                <div className="flex flex-col">
                                    <motion.h2
                                        key={currentPrice * quantity}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-4xl md:text-5xl font-black text-flyer-red tracking-tight leading-none italic"
                                    >
                                        ₵{(currentPrice * quantity).toFixed(2)}
                                    </motion.h2>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 mt-1">Total Hub Value</p>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isAdmin}
                                className={`w-full h-24 rounded-[2.5rem] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-5 transition-all shadow-2xl relative overflow-hidden group/btn ${isAdmin
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-slate-900 text-white hover:scale-[1.02] active:scale-[0.98] shadow-slate-900/30"
                                    }`}
                            >
                                <ShoppingCart className="w-7 h-7 transition-transform group-hover/btn:-rotate-12" />
                                <span>{isAdmin ? "Admin Restricted" : "Add to Cart"}</span>
                                <ChevronRight className="w-5 h-5 opacity-30 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-100">
                            {[
                                { icon: Truck, color: "text-flyer-red" },
                                { icon: Shield, color: "text-flyer-green" },
                                { icon: RotateCcw, color: "text-flyer-navy" },
                            ].map((item, idx) => (
                                <div key={idx} className={`w-full aspect-square rounded-[2rem] bg-white border border-slate-50 flex items-center justify-center shadow-sm ${item.color}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox / Fullscreen View */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
                        onClick={() => setShowLightbox(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full max-w-6xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowLightbox(false)} className="absolute -top-16 right-0 w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10">
                                <ArrowLeft className="w-6 h-6 rotate-90" />
                            </button>
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-contain"
                                unoptimized={product.images[selectedImage]?.startsWith('/')}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
