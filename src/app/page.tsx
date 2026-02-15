"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types";
import {
  ArrowRight, ShoppingBag, Zap,
  ChevronRight, Smartphone, Laptop, Home as HomeIcon, Tv,
  Gamepad, Watch, Headphones, Layers, MessageCircle
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Heart } from "lucide-react";

import { useConfig } from "@/context/ConfigContext";
import { useCart } from "@/context/CartContext";

const FALLBACK_CAROUSEL_SLIDES = [
  {
    title: "University Shop",
    subtitle: "Ghana's Premium Campus Hub",
    image: "/images/Costero carousel.jpeg",
    accent: "bg-slate-900",
    noBlur: true
  },
  {
    title: "Eco-Friendly Tech",
    subtitle: "Sustainable Gadgets for a Greener Ghana",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop",
    accent: "bg-flyer-navy"
  },
  {
    title: "Premium Mobile Gear",
    subtitle: "Next-Gen Accessories for the Modern Scholar",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop",
    accent: "bg-flyer-green"
  },
  {
    title: "Valentine's Special",
    subtitle: "Celebrate with 5% OFF everything!",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
    accent: "bg-flyer-red",
    isPromoSlide: true
  }
];

interface CarouselSlide {
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  isPromoSlide?: boolean;
}


import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const { config, categories, loading: configLoading } = useConfig();
  const { isPromoActive } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(FALLBACK_CAROUSEL_SLIDES);

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const carouselDoc = await getDoc(doc(db, "settings", "carousel"));
        if (carouselDoc.exists()) {
          const data = carouselDoc.data();
          if (data.slides && data.slides.length > 0) {
            setCarouselSlides(data.slides);
          }
        }
      } catch (error) {
        console.error("Error fetching carousel slides:", error);
      }
    };
    fetchCarousel();
  }, []);

  const filteredSlides = carouselSlides.filter(slide => !slide.isPromoSlide || isPromoActive);

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);

  // Helper to get products for a specific category from the preview list
  const getCategoryProducts = (categoryName: string) => {
    return previewProducts.filter(p => p.category === categoryName);
  };

  useEffect(() => {
    // Fetch top products for the mega menu (optimization: fetch once and filter client side)
    const fetchPreviewProducts = async () => {
      try {
        const { collection, getDocs, query, where, orderBy, limit } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");

        const q = query(collection(db, "products"), limit(300));
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Product))
          .filter(p => p.status === "approved" || !p.status);

        data.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate?.() || new Date(0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        setPreviewProducts(data);
      } catch (err) {
        console.error("Failed to load preview products", err);
      }
    };
    fetchPreviewProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [filteredSlides.length]);

  // Current active slide
  const slide = filteredSlides[currentSlide];

  return (
    <div className="flex flex-col w-full min-h-screen bg-flyer-light">
      {/* Jumia Style Layout - Machine Adaptive */}
      <section className="max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6 md:py-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[550px]">

          {/* Sidebar - Mobile Horizontal Scroll, Desktop Vertical */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative z-30 overflow-x-auto lg:overflow-visible">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Explore Categories</h2>
            <div className="flex lg:flex-col gap-2 lg:space-y-1 lg:gap-0 relative min-w-max lg:min-w-0" onMouseLeave={() => setHoveredCategory(null)}>
              {categories.map((cat) => (
                <div key={cat.name} className="relative group/idx" onMouseEnter={() => setHoveredCategory(cat.name)}>
                  <Link
                    href={`/shop?category=${cat.name}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all group whitespace-nowrap lg:whitespace-normal min-w-fit"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:scale-105 transition-all shadow-sm border border-slate-100">
                        <cat.icon className="w-4 h-4 text-slate-400 group-hover:text-flyer-red transition-colors" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 group-hover:text-flyer-red transition-colors uppercase tracking-tight">{cat.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-flyer-red transition-all group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}

              {/* Mega Menu Flyout */}
              <AnimatePresence>
                {hoveredCategory && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-full top-0 ml-4 w-[820px] min-h-full h-auto bg-white rounded-[24px] shadow-2xl border border-slate-100 p-3 z-50 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">
                        {hoveredCategory}
                        <span className="text-slate-300 not-italic font-normal text-xs ml-2 tracking-normal">Selection</span>
                      </h3>
                      <Link href={`/shop?category=${hoveredCategory}`} className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 hover:bg-flyer-red hover:text-white transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest">View All</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <div className="flex-1">
                      {getCategoryProducts(hoveredCategory).length > 0 ? (
                        <div className="grid grid-cols-3 gap-3 h-full">
                          {getCategoryProducts(hoveredCategory)
                            .slice(0, 5)
                            .map(product => (
                              <Link href={`/shop/${product.id}`} key={product.id} className="group/item block relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hover:border-flyer-red/30 hover:shadow-lg hover:shadow-flyer-red/5 transition-all duration-300">
                                <div className="aspect-[3/4] relative overflow-hidden">
                                  <Image
                                    src={product.images && product.images[0] ? product.images[0] : "https://placehold.co/600x800/png?text=No+Image"}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover/item:scale-105 transition-transform duration-700 ease-out"
                                    unoptimized={product.images?.[0]?.startsWith('/') || product.images?.[0]?.startsWith('http')}
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 flex flex-col justify-end">
                                    <p className="text-[9px] font-bold text-white uppercase tracking-wider truncate leading-tight">{product.name}</p>
                                    <p className="text-[8px] text-slate-300 opacity-80">View Details</p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                          <ShoppingBag className="w-12 h-12 text-slate-300" />
                          <p className="text-sm font-bold text-slate-400">Fresh stock arriving soon for {hoveredCategory}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Hero Carousel - Machine Adaptive Height */}
          <div className="lg:col-span-9 relative rounded-3xl md:rounded-[32px] overflow-hidden shadow-2xl group border-4 md:border-[8px] border-white h-[400px] lg:h-full min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 ${(slide as any).bgColor || 'bg-slate-100'} overflow-hidden rounded-[24px]`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className={(slide as any).objectFit || "object-cover"}
                  style={(slide as any).objectPosition ? { objectPosition: (slide as any).objectPosition } : undefined}
                  priority
                />

                {/* Selective Dark Overlay for Banners */}
                {(slide as any).objectFit === 'cover' && (
                  <div className="absolute inset-0 bg-black/30 z-0" />
                )}

                <div className={`absolute inset-0 z-10 ${(slide as any).noBlur ? '' : 'bg-gradient-to-r from-white via-white/40 to-transparent'} flex items-center px-8 md:px-16`}>
                  <div className="max-w-md space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="w-8 md:w-12 h-1 bg-flyer-red rounded-full" />
                      <motion.p className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] ${(slide as any).noBlur ? 'text-white' : 'text-flyer-red'}`}>
                        {config?.brand.name || "University"} Exclusives
                      </motion.p>
                    </div>
                    <motion.h1 className={`text-4xl md:text-5xl lg:text-7xl font-black leading-tight tracking-tighter ${(slide as any).noBlur ? 'text-white' : 'text-slate-900'}`}>
                      {slide.title.split(' ')[0]} <br />
                      <span className={`italic ${(slide as any).noBlur ? 'text-white' : 'text-flyer-red'}`}>{slide.title.split(' ')[1]}</span>
                    </motion.h1>
                    {slide.subtitle && (
                      <p className={`text-sm md:text-xl font-bold italic ${(slide as any).noBlur ? 'text-white/90' : 'text-slate-600'}`}>{slide.subtitle}</p>
                    )}
                    <div className="pt-2 md:pt-4">
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-12 py-3.5 md:py-6 bg-flyer-red text-white text-xs md:text-lg font-black rounded-full hover:scale-105 transition-all shadow-xl shadow-flyer-red/30 active:scale-95"
                      >
                        Explore Now
                        <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 md:bottom-10 right-8 md:right-12 flex gap-2 md:gap-4">
              {filteredSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? "w-10 md:w-16 bg-flyer-red" : "w-1.5 md:w-2 bg-white/50"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee - Flyer Colors */}
      <div className="bg-white border-y border-slate-100 py-10 md:py-16 overflow-hidden mt-12 md:mt-24">
        <div className="flex items-center gap-20 animate-marquee whitespace-nowrap">
          {[
            "Apple", "Samsung", "HP", "Dell", "Nike", "Infinix", "PlayStation", "JBL",
            "Apple", "Samsung", "HP", "Dell", "Nike", "Infinix", "PlayStation", "JBL"
          ].map((brand, idx) => (
            <Link key={idx} href={`/shop?q=${encodeURIComponent(brand)}`} className="flex items-center gap-20 group cursor-pointer">
              <span className="text-2xl md:text-4xl font-black text-slate-200 tracking-tighter group-hover:text-flyer-red transition-colors uppercase cursor-pointer italic">
                {brand}
              </span>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-flyer-green" />
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Grid - Flyer Style */}
      <section className="py-16 md:py-24 max-w-[1440px] mx-auto w-full px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16 space-y-3 md:space-y-4">
          <Link href="/shop" className="flyer-banner hover:scale-105 transition-transform cursor-pointer text-[10px] md:text-xs">Shop by Hub</Link>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">University Favorites</h2>
          <p className="text-slate-500 text-sm md:text-base font-bold max-w-xl">{config?.brand.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { name: "Phones & Tablets", color: "bg-flyer-red", icon: Smartphone, desc: "iPhones, Samsung & More", category: "Phones & Tablets" },
            { name: "Fashion & Sneakers", color: "bg-flyer-green", icon: Zap, desc: "Campus Style Essentials", category: "Fashion" },
            { name: "Laptops & Electronics", color: "bg-flyer-navy", icon: Laptop, desc: "Study & Entertainment", category: "Laptops & Computers" },
            { name: "Gaming & Appliances", color: "bg-flyer-blue", icon: HomeIcon, desc: "Campus Life Essentials", category: "Gaming" },
          ].map((item, idx) => (
            <Link key={idx} href={item.category ? `/shop?category=${encodeURIComponent(item.category)}` : "/shop"}>
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-white p-8 md:p-10 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100 group cursor-pointer hover:border-flyer-red/30 transition-all h-full"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl ${item.color} flex items-center justify-center mb-6 md:mb-8 shadow-lg group-hover:rotate-6 transition-transform`}>
                  <item.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">{item.name}</h3>
                <p className="text-xs md:text-sm text-slate-500 font-bold mb-6 md:mb-8">{item.desc}</p>
                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-black text-flyer-red uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  View All <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now - Consolidated Section */}
      <section className="py-16 md:py-24 max-w-[1440px] mx-auto w-full px-4 md:px-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-12 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-tight">
              Trending <span className="text-flyer-red">This Season</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest px-1">Curated Essentials • Hub Picks</p>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl hover:bg-flyer-red hover:border-flyer-red transition-all shadow-sm w-full md:w-auto justify-center md:justify-start"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Go to Shop</span>
            <ArrowRight className="w-4 h-4 text-flyer-red group-hover:text-white transition-colors" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
          {previewProducts.slice(0, 15).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/shop"
            className="w-full sm:w-auto text-center px-10 md:px-12 py-4 md:py-5 bg-slate-900 text-white font-black rounded-full hover:bg-flyer-red transition-all shadow-xl hover:translate-y-[-4px] active:translate-y-0 text-xs md:text-base uppercase tracking-widest"
          >
            VIEW FULL CATALOGUE
          </Link>
        </div>
      </section>

      {/* Official Flyer Banner Recap */}
      <section className="bg-slate-900 py-16 text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
          <div className="space-y-3">
            <span className="text-flyer-green font-black uppercase tracking-widest text-[10px] md:text-xs">AAMUSTED Campus Hub</span>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight">{config?.brand.tagline.toLowerCase() || "affordability at its best!"}</h2>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-end gap-6 w-full lg:w-auto">
            <a href="tel:0599764428" className="relative p-[2px] rounded-2xl md:rounded-3xl group transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-flyer-red via-flyer-blue to-flyer-red animate-gradient-x opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white text-slate-900 p-6 md:p-8 rounded-[calc(1rem+6px)] md:rounded-[calc(1.5rem-2px)] flex items-center gap-5 md:gap-6 backdrop-blur-3xl overflow-hidden min-w-[240px] md:min-w-[280px]">
                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-2 transition-transform">
                  <Smartphone className="w-16 md:w-24 h-16 md:h-24" />
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-flyer-red to-[#ff4d4d] flex items-center justify-center shadow-lg shadow-flyer-red/20 group-hover:rotate-12 transition-transform shrink-0">
                  <Smartphone className="w-6 md:w-7 h-6 md:h-7 text-white" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-2">Primary Office</p>
                  <p className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 group-hover:text-flyer-red transition-colors italic">0599764428</p>
                </div>
              </div>
            </a>

            <a href={config?.contact?.whatsapp || config?.brand?.whatsapp || "#"} target="_blank" rel="noopener noreferrer" className="relative p-[2px] rounded-2xl md:rounded-3xl group transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#25D366] animate-gradient-x opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white text-slate-900 p-6 md:p-8 rounded-[calc(1rem+6px)] md:rounded-[calc(1.5rem-2px)] flex items-center gap-5 md:gap-6 backdrop-blur-3xl overflow-hidden min-w-[240px] md:min-w-[280px]">
                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-2 transition-transform">
                  <MessageCircle className="w-16 md:w-24 h-16 md:h-24" />
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform shrink-0">
                  <MessageCircle className="w-6 md:w-7 h-6 md:h-7 text-white fill-white" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-2">Direct Hub Chat</p>
                  <p className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 group-hover:text-[#25D366] transition-colors italic">0591634650</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
