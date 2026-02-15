"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Truck, CreditCard, Lock, CheckCircle2, ArrowRight, ArrowLeft, MapPin, Phone, Mail, User, ShieldCheck, ShoppingBag, AlertTriangle } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import PaystackPayment, { PaystackReference } from "@/components/payment/PaystackPayment";

export default function CheckoutPage() {
    const { cart, totalPrice, grandTotal, totalItems, appliedCoupon, applyCoupon, removeCoupon, getDiscountAmount, getPromoDiscountAmount, clearCart, isPromoActive, selectedDiscountType, setSelectedDiscountType, promoConfig, couponsGloballyEnabled } = useCart();
    const { user, profile } = useAuth();
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeStep, setActiveStep] = useState(1); // 1: Delivery, 2: Payment

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        phone: "",
    });
    const router = useRouter();

    // Sync auth data
    React.useEffect(() => {
        if (user || profile) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || profile?.displayName || "",
                email: user?.email || "",
                phone: prev.phone || profile?.phoneNumber || "",
                address: prev.address || profile?.address || "",
            }));
        }
    }, [user, profile]);

    const handlePlaceOrder = async (e: React.FormEvent | null, reference?: PaystackReference) => {
        if (e) e.preventDefault();

        if (!user) {
            router.push("/login?redirect=/checkout");
            return;
        }

        if (!formData.address || !formData.city || !formData.phone) {
            alert("Please complete all shipping details.");
            return;
        }

        if (!reference) return;

        setLoading(true);
        try {
            const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reference: reference.reference,
                    expectedAmount: grandTotal
                }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.message || "Payment verification failed.");

            const itemsWithUniqueIds = cart.map(item => ({
                ...item,
                trackingId: `HUB-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`
            }));

            const readableOrderId = `HUB-ORD-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

            const orderData = {
                orderId: readableOrderId,
                userId: user.uid,
                userName: formData.name,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                phone: formData.phone,
                items: itemsWithUniqueIds,
                trackingIds: itemsWithUniqueIds.map(i => i.trackingId),
                total: grandTotal,
                status: "pending",
                paymentStatus: "paid",
                paymentReference: reference.reference,
                createdAt: serverTimestamp(),
                verificationData: verifyData.data,
                couponCode: appliedCoupon?.code || null,
            };

            await addDoc(collection(db, "orders"), orderData);

            // Notifications
            let couponOwnerData = null;
            if (appliedCoupon) {
                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const userRef = doc(db, "users", appliedCoupon.ambassadorId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        couponOwnerData = {
                            email: data.email,
                            phoneNumber: data.phoneNumber,
                            displayName: data.displayName || data.username
                        };
                    }
                } catch (err) { console.error(err); }
            }

            fetch("/api/notifications/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: readableOrderId,
                    items: cart,
                    total: grandTotal,
                    customerName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    couponCode: appliedCoupon?.code,
                    couponOwner: couponOwnerData
                })
            });

            setSuccess(true);
            clearCart();
        } catch (error: any) {
            alert(error.message || "Failed to finalize order.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-flyer-light flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_0%,#ef444405_0%,transparent_50%)]">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-white p-12 md:p-20 rounded-[4rem] text-center max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-50 overflow-hidden"
                >
                    {/* Decorative Patterns */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-flyer-red via-flyer-green to-flyer-red animate-gradient-x" />

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-32 h-32 bg-flyer-green/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 relative"
                    >
                        <div className="absolute inset-0 rounded-[2.5rem] border-4 border-flyer-green/20 animate-ping opacity-20" />
                        <CheckCircle2 className="w-16 h-16 text-flyer-green" />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter leading-none">
                        Order <br /><span className="text-flyer-red">Confirmed</span>
                    </h1>

                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-12 leading-relaxed max-w-sm mx-auto">
                        Thank you for your purchase. We've sent a confirmation email to {formData.email} and our team has been notified.
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            href="/profile"
                            className="group h-24 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-6 hover:bg-black transition-all shadow-2xl shadow-slate-900/40 active:scale-95"
                        >
                            Track My Order
                            <ArrowRight className="w-6 h-6 text-flyer-red group-hover:translate-x-3 transition-transform duration-500" />
                        </Link>
                        <Link
                            href="/"
                            className="h-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-flyer-red transition-all"
                        >
                            Return to Shop
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-flyer-light min-h-screen pt-40 pb-32">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-[10%] w-[600px] h-[600px] bg-flyer-red/[0.03] rounded-full blur-[140px]" />
                <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] bg-flyer-green/[0.02] rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="h-[2px] w-12 bg-flyer-red rounded-full" />
                            <span className="text-[10px] font-black text-flyer-red uppercase tracking-[0.5em]">Step 2 of 2</span>
                        </motion.div>
                        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 italic uppercase leading-[0.8]">
                            Final <br /><span className="text-flyer-red">Checkout</span>
                        </h1>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-6 p-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-2xl">
                        {[1, 2].map(step => (
                            <button
                                key={step}
                                onClick={() => step < activeStep && setActiveStep(step)}
                                className={`flex items-center gap-4 px-8 py-4 rounded-3xl transition-all font-black uppercase text-[10px] tracking-widest ${activeStep === step
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                                    : step < activeStep ? "text-flyer-green bg-flyer-green/5" : "text-slate-300 pointer-events-none"
                                    }`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${activeStep === step ? "border-flyer-red text-flyer-red" : "border-slate-200"
                                    }`}>
                                    {step < activeStep ? "✓" : step}
                                </span>
                                {step === 1 ? "Logistics" : "Payment"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-7 space-y-16">
                        <AnimatePresence mode="wait">
                            {activeStep === 1 ? (
                                <motion.div
                                    key="logistics"
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    className="space-y-10"
                                >
                                    <div className="bg-white p-12 md:p-14 rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <Truck className="w-12 h-12 text-slate-50 group-hover:text-flyer-red/5 transition-colors duration-1000" />
                                        </div>

                                        <div className="flex items-center gap-6 mb-12">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-flyer-red shadow-xl">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Delivery Details</h2>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Provide your campus routing info</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3 group/field">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                    <User className="w-3 h-3 group-hover/field:text-flyer-red transition-colors" /> Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-50 border-4 border-transparent rounded-[2rem] px-8 py-6 text-sm focus:outline-none focus:border-flyer-red/10 font-bold text-slate-900 transition-all placeholder:text-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                    <Mail className="w-3 h-3" /> Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    required
                                                    value={formData.email}
                                                    disabled
                                                    className="w-full bg-slate-100/50 border-4 border-slate-100/50 rounded-[2rem] px-8 py-6 text-sm font-bold text-slate-400 opacity-60 cursor-not-allowed uppercase tracking-widest"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> Full Address
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Hostel / Office / Residence"
                                                    required
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full bg-slate-50 border-4 border-transparent rounded-[2rem] px-8 py-6 text-sm focus:outline-none focus:border-flyer-red/10 font-bold text-slate-900 transition-all placeholder:text-slate-200 italic"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Zone</label>
                                                <input
                                                    type="text"
                                                    placeholder="City / Region"
                                                    required
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full bg-slate-50 border-4 border-transparent rounded-[2rem] px-8 py-6 text-sm focus:outline-none focus:border-flyer-red/10 font-bold text-slate-900 transition-all placeholder:text-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" /> Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    placeholder="MoMo / WhatsApp Line"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-slate-50 border-4 border-transparent rounded-[2rem] px-8 py-6 text-sm focus:outline-none focus:border-flyer-red/10 font-bold text-slate-900 transition-all placeholder:text-slate-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (formData.address && formData.city && formData.phone && formData.name) {
                                                setActiveStep(2);
                                            } else {
                                                alert("All logistics fields are mandatory.");
                                            }
                                        }}
                                        className="w-full h-24 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-6 hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group"
                                    >
                                        Confirm & Proceed
                                        <ArrowRight className="w-6 h-6 text-flyer-red group-hover:translate-x-3 transition-transform duration-500" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    className="space-y-10"
                                >
                                    <div className="bg-white p-12 md:p-14 rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <CreditCard className="w-12 h-12 text-slate-50 group-hover:text-flyer-red/5 transition-colors duration-1000" />
                                        </div>

                                        <div className="flex items-center gap-6 mb-12">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-flyer-green shadow-xl">
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Payment Method</h2>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Paystack Gateway</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-slate-900 p-8 rounded-[2.5rem] flex items-center justify-between border-4 border-slate-900 shadow-2xl shadow-slate-900/20 group cursor-default">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                                                        <Image src="/icon.png" alt="University Shop" width={40} height={40} className="object-contain" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-sm uppercase tracking-widest">Pay via Paystack</p>
                                                        <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest">Verified Merchant Account</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Lock className="w-4 h-4 text-flyer-green" />
                                                    <div className="w-6 h-6 rounded-full bg-flyer-red relative">
                                                        <div className="absolute inset-1 rounded-full border-2 border-white/20 animate-ping" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed text-center">
                                                    Your payment information is end-to-end encrypted. <br /> University Shop does not store your card details.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <PaystackPayment
                                            email={formData.email}
                                            amount={grandTotal}
                                            metadata={{
                                                name: formData.name,
                                                phone: formData.phone,
                                                coupon_code: appliedCoupon?.code || "none",
                                                custom_fields: [
                                                    {
                                                        display_name: "Items",
                                                        variable_name: "items",
                                                        value: cart.map(i => `${i.quantity}x ${i.name}`).join(", ")
                                                    }
                                                ]
                                            }}
                                            disabled={!formData.address || !formData.city || !formData.phone || !formData.name}
                                            onSuccess={(reference: PaystackReference) => {
                                                handlePlaceOrder(null, reference);
                                            }}
                                            onClose={() => alert("Payment cancelled.")}
                                        />

                                        <button
                                            onClick={() => setActiveStep(1)}
                                            className="w-full h-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-flyer-red transition-all flex items-center justify-center gap-4 group"
                                        >
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                                            Back to Delivery Details
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Summary Recap Sidebar */}
                    <div className="lg:col-span-5 relative lg:sticky lg:top-40">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-12 md:p-14 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50 space-y-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-flyer-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Order Summary</h2>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{totalItems} Items</span>
                            </div>

                            <div className="space-y-8 max-h-96 overflow-y-auto pr-6 no-scrollbar border-b border-slate-50 pb-10">
                                {cart.map((item) => (
                                    <div key={item.productId} className="flex gap-8 group">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-[#f9f9fb] relative flex-shrink-0 border-4 border-white shadow-xl overflow-hidden p-3 transition-transform group-hover:-rotate-2">
                                            <Image
                                                src={item.image || "/images/placeholder.png"}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized={item.image?.startsWith('/')}
                                            />
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight italic leading-tight group-hover:text-flyer-red transition-colors">{item.name}</p>
                                            <div className="flex items-center gap-4">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Qty: {item.quantity}</p>
                                                <div className="w-1 h-1 bg-slate-100 rounded-full" />
                                                <p className="font-black text-[13px] text-slate-900 italic tracking-tighter leading-none">₵{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <span>Bag Sub-Total</span>
                                    <span className="text-slate-900">₵ {totalPrice.toFixed(2)}</span>
                                </div>
                                {isPromoActive && (
                                    <div className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest transition-opacity ${selectedDiscountType === 'promo' ? 'text-flyer-red' : 'opacity-30'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                id="use-promo"
                                                name="discount-choice"
                                                checked={selectedDiscountType === 'promo'}
                                                onChange={() => setSelectedDiscountType('promo')}
                                                className="w-3 h-3 accent-flyer-red"
                                            />
                                            <label htmlFor="use-promo" className="cursor-pointer">Site-wide Promo ({promoConfig.name})</label>
                                        </div>
                                        <span>- ₵ {getPromoDiscountAmount().toFixed(2)}</span>
                                    </div>
                                )}
                                {appliedCoupon && (
                                    <div className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest transition-opacity ${selectedDiscountType === 'coupon' ? 'text-flyer-red' : 'opacity-30'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                id="use-coupon"
                                                name="discount-choice"
                                                checked={selectedDiscountType === 'coupon'}
                                                onChange={() => setSelectedDiscountType('coupon')}
                                                className="w-3 h-3 accent-flyer-red"
                                            />
                                            <label htmlFor="use-coupon" className="cursor-pointer">Ambassador Code ({appliedCoupon.code})</label>
                                        </div>
                                        <span>- ₵ {getDiscountAmount().toFixed(2)}</span>
                                    </div>
                                )}
                                {(isPromoActive || appliedCoupon) && (
                                    <div className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest transition-opacity ${selectedDiscountType === 'none' ? 'text-slate-900' : 'opacity-30'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                id="use-none"
                                                name="discount-choice"
                                                checked={selectedDiscountType === 'none'}
                                                onChange={() => setSelectedDiscountType('none')}
                                                className="w-3 h-3 accent-slate-900"
                                            />
                                            <label htmlFor="use-none" className="cursor-pointer">No Discount Applied</label>
                                        </div>
                                        <span>₵ 0.00</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <span>Hub Logistics Fee</span>
                                    <span className="text-flyer-green bg-flyer-green/10 px-3 py-1 rounded-lg">FREETIER</span>
                                </div>
                                <div className="pt-8 border-t-4 border-slate-900/5 flex justify-between items-center">
                                    <span className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Final Amount</span>
                                    <div className="text-right">
                                        <span className="block text-5xl font-black text-flyer-red italic tracking-tighter leading-none">₵ {grandTotal.toFixed(2)}</span>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 transform -translate-y-1">Tax Inclusive</p>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Section - Hidden if site-wide promo is active or system is disabled */}
                            <div className="pt-10 border-t border-slate-100">
                                {!couponsGloballyEnabled ? (
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200/20 blur-2xl rounded-full" />
                                        <div className="relative z-10 flex gap-4">
                                            <Shield className="w-5 h-5 text-slate-400 shrink-0" />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coupon System Offline</p>
                                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                                                    The ambassador coupon system is currently undergoing maintenance or is globally disabled.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : isPromoActive ? (
                                    <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 blur-2xl rounded-full" />
                                        <div className="relative z-10 flex gap-4">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <div>
                                                <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest mb-1">Coupon Protocol Restricted</p>
                                                <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                                    Active promotions override all individual ambassador coupons. Switch off the promo if you wish to apply a code.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-flyer-red/10 blur-2xl rounded-full" />
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest mb-1">Code Applied</p>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">{appliedCoupon.code}</p>
                                        </div>
                                        <button
                                            onClick={removeCoupon}
                                            className="relative z-10 text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors py-2 px-6 border border-white/10 rounded-xl"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="AMBASSADOR CODE"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value);
                                                    setCouponError("");
                                                }}
                                                className="w-full bg-slate-50 border-4 border-transparent focus:border-flyer-red/10 rounded-[1.8rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all outline-none placeholder:text-slate-200"
                                            />
                                            <button
                                                type="button"
                                                disabled={couponLoading || !couponCode}
                                                onClick={async () => {
                                                    setCouponLoading(true);
                                                    const res = await applyCoupon(couponCode);
                                                    if (!res.success) setCouponError(res.error || "Invalid Protocol");
                                                    setCouponLoading(false);
                                                }}
                                                className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                            >
                                                {couponLoading ? "..." : "APPLY"}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] font-black text-flyer-red uppercase tracking-widest ml-6 italic">{couponError}</motion.p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-center gap-6 border border-slate-100">
                                <ShieldCheck className="w-8 h-8 text-flyer-green flex-shrink-0" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Secure Checkout Guaranteed<br />
                                    <span className="text-slate-900 italic">University Shop verified merchant 2026</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
