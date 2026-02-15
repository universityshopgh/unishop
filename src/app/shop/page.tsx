"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Heart, Sparkles, Layers } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";
import { useCart } from "@/context/CartContext";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import ProductCard from "@/components/ui/ProductCard";

const WrapperCheck = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

function ShopContent() {
    const { categories, loading: configLoading } = useConfig();
    const { promoConfig, isPromoActive } = useCart();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
        const categoryParam = searchParams.get("category");
        if (!categoryParam) return [];
        return categoryParam.split(',').map(c => c.trim()).filter(c => c.length > 0);
    });
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [sortBy, setSortBy] = useState("newest");

    // Sync state with URL parameters (for when navigating while on the shop page)
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        console.log("🔍 URL category parameter:", categoryParam);
        if (categoryParam) {
            // Split by comma to support multiple categories like "Laptops,Computers"
            const categories = categoryParam.split(',').map(c => c.trim()).filter(c => c.length > 0);
            setSelectedCategories(categories);
            console.log("✅ Selected categories set to:", categories);
        } else {
            setSelectedCategories([]);
        }

        const queryParam = searchParams.get("q");
        if (queryParam) {
            setSearchQuery(queryParam);
        }
    }, [searchParams]);

    const getSortedProducts = (products: Product[]) => {
        let sorted = [...products];
        if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
        if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
        if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
        return sorted;
    };

    const displayedProducts = getSortedProducts(products.filter(product => {
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.some(cat => {
                const catLower = cat.toLowerCase();
                const productCatLower = product.category.toLowerCase();
                // Exact match OR singular/plural variations
                return productCatLower === catLower ||
                    productCatLower === catLower + 's' ||
                    productCatLower + 's' === catLower ||
                    productCatLower === catLower.slice(0, -1);
            });

        return matchesSearch && matchesCategory;
    }));

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const productsData = await productService.getProducts();

                const flattenedProducts: Product[] = [];
                productsData.forEach(product => {
                    if (product.variants && product.variants.length > 0) {
                        product.variants.forEach(variant => {
                            flattenedProducts.push({
                                ...product,
                                id: `${product.id}?v=${variant.id}`,
                                name: `${product.name} - ${variant.name}`,
                                price: variant.price,
                                originalPrice: variant.originalPrice || product.originalPrice,
                                images: [variant.image, ...product.images.filter(img => img !== variant.image)],
                                variants: []
                            });
                        });
                    } else {
                        flattenedProducts.push(product);
                    }
                });

                flattenedProducts.sort((a, b) => {
                    const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate?.() || new Date(0);
                    const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate?.() || new Date(0);
                    return Number(dateB) - Number(dateA);
                });

                setProducts(flattenedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="bg-flyer-light min-h-screen pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24">
                {isPromoActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 p-8 rounded-[40px] bg-gradient-to-r from-flyer-red to-[#ff4d4d] text-white relative overflow-hidden shadow-2xl shadow-flyer-red/20"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Heart className="w-48 h-48 fill-current" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-amber-300 fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Season of Love</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">
                                    {promoConfig.name}
                                </h2>
                                <p className="text-white/90 text-xs md:text-base font-bold italic tracking-tight text-balance">{promoConfig.discountPercent}% Instant Discount Applied to All Gear</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl px-8 py-4 border border-white/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Coupon Automatic</p>
                                <p className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">Price Reductions Live</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-flyer-red animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-flyer-red">Authorized Hub</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">
                            The Gear <span className="text-flyer-red">Vault</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search the hub..."
                                className="w-full md:w-80 bg-white border-2 border-slate-50 rounded-[2rem] py-4 md:py-5 px-14 md:px-16 text-sm focus:outline-none focus:border-flyer-red/20 shadow-xl shadow-slate-200/50 font-bold text-slate-900"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-auto bg-white border-2 border-slate-50 rounded-[2rem] py-4 md:py-5 px-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:border-flyer-red/20 shadow-xl shadow-slate-200/50 cursor-pointer appearance-none hover:bg-slate-50 transition-colors"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar - Desktop */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filters</h3>
                                <button
                                    onClick={() => setSelectedCategories([])}
                                    className="text-[10px] font-bold text-flyer-red hover:underline uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={selectedCategories.length === 0}
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map((cat) => {
                                            if (!cat?.name) return null;
                                            const isSelected = selectedCategories.some(selected => {
                                                const match = selected.toLowerCase().trim() === cat.name.toLowerCase().trim();
                                                if (cat.name.includes("Phones")) {
                                                    console.log(`🔍 Comparing: "${selected}" vs "${cat.name}" = ${match}`);
                                                }
                                                return match;
                                            });
                                            const count = products.filter(p =>
                                                p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
                                            ).length;

                                            return (
                                                <label
                                                    key={cat.name}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group border border-transparent ${isSelected ? "bg-slate-50 border-slate-200/60 shadow-sm" : "hover:border-slate-100"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected
                                                            ? "bg-flyer-red border-flyer-red"
                                                            : "border-slate-300 group-hover:border-flyer-red/50 bg-white"
                                                            }`}>
                                                            {isSelected && (
                                                                <WrapperCheck className="w-3.5 h-3.5 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isSelected
                                                                ? "bg-flyer-red text-white shadow-md shadow-flyer-red/30"
                                                                : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-flyer-red group-hover:shadow-sm"
                                                                }`}>
                                                                <cat.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                                            </div>
                                                            <span className={`text-sm font-bold transition-colors ${isSelected ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                                                                }`}>
                                                                {cat.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black py-0.5 px-2 rounded-full transition-colors ${isSelected
                                                        ? "bg-flyer-red text-white"
                                                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                                        }`}>
                                                        {count}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            if (isSelected) {
                                                                setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                                            } else {
                                                                setSelectedCategories([...selectedCategories, cat.name]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        {/* Mobile Categories Scroll (Hidden on Desktop) */}
                        <div className="lg:hidden mb-8">
                            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
                                {categories.map((cat) => {
                                    const isActive = selectedCategories.includes(cat.name);
                                    const count = products.filter(p => p.category === cat.name).length;

                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => {
                                                if (isActive) {
                                                    setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                                } else {
                                                    setSelectedCategories([...selectedCategories, cat.name]);
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${isActive
                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-flyer-red/30"
                                                }`}
                                        >
                                            <cat.icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                                            {cat.name}
                                            <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                                                }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-[10px] font-black text-flyer-red uppercase tracking-widest hidden md:inline-block">Displaying</span>
                            <div className="h-[1px] flex-grow bg-slate-100 hidden md:block" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {displayedProducts.length} Products Found
                            </span>
                        </div>

                        {loading || configLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-[420px] bg-white border border-slate-100 animate-pulse rounded-[32px]" />
                                ))}
                            </div>
                        ) : displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-white border-2 border-dashed border-slate-100 rounded-[40px]">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 mb-2 uppercase italic">No Matches Found</h2>
                                <p className="text-slate-400 font-bold mb-8 max-w-xs mx-auto text-xs uppercase tracking-wide">Adjust your filters to find what you're looking for.</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setSearchQuery("");
                                    }}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-flyer-red text-white font-black rounded-full shadow-lg shadow-flyer-red/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                                >
                                    Clear Filters
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-flyer-light flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-flyer-red/20 border-t-flyer-red rounded-full animate-spin"></div>
            </div>
        }>
            <ShopContent />
        </React.Suspense>
    );
}
