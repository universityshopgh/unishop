"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { Order } from "@/types";
import { motion } from "framer-motion";
import { Package, MapPin, Clock, ShieldCheck, ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TRACKING_STEPS = [
    { status: "pending", label: "Hub Received", desc: "Order logged in system" },
    { status: "processing", label: "Hub Verified", desc: "Security check & packing" },
    { status: "shipped", label: "In Transit", desc: "Gear on the way to you" },
    { status: "delivered", label: "Secured", desc: "Package delivered" }
];

export default function OrderTrackingDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                // Try fetching by Document ID first (Order ID)
                const docRef = doc(db, "orders", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
                } else {
                    // Try fetching by human-readable Order ID (HUB-ORD-...)
                    const qOrder = query(
                        collection(db, "orders"),
                        where("orderId", "==", id as string)
                    );
                    const orderSnapshot = await getDocs(qOrder);

                    if (!orderSnapshot.empty) {
                        const targetDoc = orderSnapshot.docs[0];
                        setOrder({ id: targetDoc.id, ...targetDoc.data() } as Order);
                    } else {
                        // Try fetching by Item Tracking ID (HUB-XXXX-...)
                        const qItem = query(
                            collection(db, "orders"),
                            where("trackingIds", "array-contains", id as string)
                        );
                        const itemSnapshot = await getDocs(qItem);
                        if (!itemSnapshot.empty) {
                            const targetDoc = itemSnapshot.docs[0];
                            setOrder({ id: targetDoc.id, ...targetDoc.data() } as Order);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-flyer-red"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-flyer-light pt-40 px-4 text-center">
                <div className="max-w-md mx-auto bg-white p-12 rounded-[50px] shadow-2xl shadow-slate-200 border-4 border-dashed border-slate-50">
                    <div className="w-24 h-24 bg-red-50 text-flyer-red rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">ID Not Found</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 leading-relaxed">
                        The Hub Receipt ID you provided doesn't exist in our logs. Please verify and try again.
                    </p>
                    <button
                        onClick={() => router.push("/track")}
                        className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-[10px] hover:bg-black transition-all"
                    >
                        Return to Tracking
                    </button>
                </div>
            </div>
        );
    }

    const currentStepIndex = TRACKING_STEPS.findIndex(s => s.status === order.status);

    return (
        <div className="bg-flyer-light min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <Link href="/track" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-flyer-red uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Tracking Center
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                            Hub Protocol: <br />
                            <span className="text-flyer-red">#{order.id.slice(-8).toUpperCase()}</span>
                        </h1>
                    </div>
                    <div className="bg-white px-8 py-5 rounded-3xl shadow-xl shadow-slate-200 border border-slate-50 flex items-center gap-6">
                        <div className="w-12 h-12 bg-flyer-green/10 rounded-2xl flex items-center justify-center text-flyer-green uppercase font-black text-xs">
                            Pay
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</p>
                            <p className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{order.paymentStatus === 'paid' ? 'Secured & Verified' : 'Pending Verification'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Tracking Timeline */}
                    <div className="lg:col-span-12">
                        <div className="bg-white p-12 rounded-[60px] shadow-2xl shadow-slate-200 border border-slate-50">
                            <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2">
                                        <span className="w-6 h-1 bg-flyer-red rounded-full" />
                                        <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest italic">Live Status</p>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Logistics Timeline</h2>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest">
                                        <p className="text-slate-300 mb-1">Ordered On</p>
                                        <p className="text-slate-900">{order.createdAt instanceof Timestamp ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Status Stepper */}
                            <div className="relative pt-8 pb-12">
                                <div className="absolute top-[4.5rem] left-8 md:left-[10%] right-8 md:right-[10%] h-1 bg-slate-100 hidden md:block">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                                        className="h-full bg-flyer-red"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
                                    {TRACKING_STEPS.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;

                                        return (
                                            <div key={step.status} className="flex flex-row md:flex-col items-center md:items-center gap-6 md:gap-8 text-left md:text-center">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-xl ${isCompleted
                                                    ? 'bg-flyer-red text-white shadow-flyer-red/20 scale-110'
                                                    : 'bg-slate-50 text-slate-200 border-2 border-slate-100 shadow-none'
                                                    }`}>
                                                    {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : (index + 1)}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className={`text-xl font-black uppercase italic tracking-tighter leading-none ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                                        {step.label}
                                                    </h4>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-flyer-red' : 'text-slate-400'}`}>
                                                        {isCurrent ? 'In Progress' : step.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left: Content Grid */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Package Summary */}
                        <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-50">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Hub Content</h3>
                                <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    {order.items.length} Secure Items
                                </span>
                            </div>

                            <div className="space-y-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-white p-2 rounded-2xl ring-1 ring-slate-100 relative">
                                                <Image
                                                    src={item.image || "https://via.placeholder.com/200x200?text=Product"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover rounded-xl"
                                                    unoptimized={item.image?.startsWith('/')}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase italic text-lg leading-tight mb-1">{item.name}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Qty: {item.quantity} | Tracking ID: {item.trackingId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 italic tracking-tighter leading-none">₵ {item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-10 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hub Total Cost</p>
                                    <p className="text-5xl font-black text-flyer-red italic tracking-tighter leading-none italic">₵ {order.total.toFixed(2)}</p>
                                </div>
                                <div className="text-right pb-2">
                                    <p className="text-[9px] font-black text-flyer-green uppercase tracking-[0.2em] italic">Full Hub Protection Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Shipping Details */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-900 p-10 rounded-[50px] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                            <MapPin className="w-16 h-16 absolute -bottom-4 -right-4 text-white/10 group-hover:scale-125 transition-transform duration-700" />

                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 leading-none border-b border-white/10 pb-6">Delivery Hub</h3>

                            <div className="space-y-8 relative">
                                <div>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Address Protocol</p>
                                    <p className="text-sm font-bold leading-relaxed text-white/90">
                                        {order.shippingAddress || order.address || "Hub Pickup Point"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Hub Contact</p>
                                    <p className="text-lg font-black italic tracking-tight">{order.phone || "No Hub Phone"}</p>
                                </div>
                                <div className="pt-8">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4 text-flyer-green" />
                                        Verified Destination
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[50px] border border-slate-50 space-y-6">
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none">Logistics Partner</h3>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-flyer-red italic italic">UH</div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase italic">UniShop Hub Logistics</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">Internal Fleet</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-slate-50 text-slate-400 hover:text-flyer-red hover:bg-slate-100 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                Print Receipt Hub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
