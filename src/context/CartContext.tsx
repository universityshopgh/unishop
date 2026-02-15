"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CartItem, Product, Coupon } from "@/types";
import { useAuth } from "./AuthContext";
import {
    PromoConfig,
    FALLBACK_PROMO_CONFIG,
    getDynamicPromoConfig,
    isPromoActive as checkPromoActive,
    getDiscountedPrice
} from "@/lib/promoUtils";
import { validateCoupon, calculateCouponDiscount } from "@/lib/coupons";

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    grandTotal: number;
    promoConfig: PromoConfig;
    isPromoActive: boolean;
    couponsGloballyEnabled: boolean;
    appliedCoupon: Coupon | null;
    selectedDiscountType: 'promo' | 'coupon' | 'none';
    setSelectedDiscountType: (type: 'promo' | 'coupon' | 'none') => void;
    applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
    removeCoupon: () => void;
    getDiscountAmount: () => number;
    getPromoDiscountAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [selectedDiscountType, setSelectedDiscountType] = useState<'promo' | 'coupon' | 'none'>('promo');
    const [promoConfig, setPromoConfig] = useState<PromoConfig>(FALLBACK_PROMO_CONFIG);
    const [isPromoActiveNow, setIsPromoActiveNow] = useState(false);
    const [couponsGloballyEnabled, setCouponsGloballyEnabled] = useState(true);

    useEffect(() => {
        // Real-time promo listener
        const promoRef = doc(db, "site_config", "promotions");
        const unsubPromo = onSnapshot(promoRef, (snap) => {
            if (snap.exists()) {
                const config = snap.data() as PromoConfig;
                setPromoConfig(config);
                const active = checkPromoActive(config);
                setIsPromoActiveNow(active);
                if (active) setSelectedDiscountType('promo');
            } else {
                setIsPromoActiveNow(false);
            }
        });

        // Real-time coupon status listener
        const couponStatusRef = doc(db, "site_config", "coupons_global");
        const unsubCoupon = onSnapshot(couponStatusRef, (snap) => {
            if (snap.exists()) {
                setCouponsGloballyEnabled(snap.data().isEnabled);
            }
        });

        return () => {
            unsubPromo();
            unsubCoupon();
        };
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedCart = localStorage.getItem("unishop_cart");
                if (savedCart) {
                    const parsedCart: CartItem[] = JSON.parse(savedCart);
                    const migratedCart = parsedCart.map(item => ({
                        ...item,
                        basePrice: item.basePrice || item.price
                    }));
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setCart(migratedCart);
                }
            } catch (e) {
                console.error("Failed to parse cart storage", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("unishop_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, quantity: number) => {
        if (!user) {
            alert("Institutional Protocol: Please sign in to add items to your cart.");
            window.location.href = `/login?redirect=${window.location.pathname}`;
            return;
        }

        if (!product.id) {
            console.error("Attempted to add product with no ID to cart");
            return;
        }
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    trackingId: `HUB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Date.now() / 1000).toString().slice(-4)}`,
                    name: product.name,
                    price: product.price, // Storing original price as the default 'price'
                    basePrice: product.price,
                    image: product.images[0] || "",
                    quantity,
                },
            ];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        setAppliedCoupon(null);
    };

    const applyCoupon = async (code: string) => {
        if (!couponsGloballyEnabled) {
            return { success: false, error: "System Alert: Coupon system is currently offline." };
        }
        if (isPromoActiveNow) {
            return { success: false, error: "Active promotions override coupons. Switch off the promo to use a code." };
        }
        const result = await validateCoupon(code);
        if (result.valid && result.coupon) {
            setAppliedCoupon(result.coupon);
            setSelectedDiscountType('coupon'); // Automatically switch to coupon if valid
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    const removeCoupon = () => setAppliedCoupon(null);

    const getDiscountAmount = () => {
        if (!appliedCoupon) return 0;
        const subtotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
        return calculateCouponDiscount(subtotal, appliedCoupon.discountValue);
    };

    const getPromoDiscountAmount = () => {
        if (!isPromoActiveNow) return 0;
        const subtotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
        return subtotal * (promoConfig.discountPercent / 100);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

    // grandTotal now depends on which discount is explicitly selected
    let currentDiscount = 0;
    if (selectedDiscountType === 'promo' && isPromoActiveNow) {
        currentDiscount = getPromoDiscountAmount();
    } else if (selectedDiscountType === 'coupon' && appliedCoupon) {
        currentDiscount = getDiscountAmount();
    }

    const grandTotal = totalPrice - currentDiscount;

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                grandTotal,
                promoConfig,
                isPromoActive: isPromoActiveNow,
                couponsGloballyEnabled,
                appliedCoupon,
                selectedDiscountType,
                setSelectedDiscountType,
                applyCoupon,
                removeCoupon,
                getDiscountAmount,
                getPromoDiscountAmount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
