"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldCheck, Clock, AlertCircle, Send, Instagram, Music, Facebook, Users, DollarSign, Gift, Calendar } from "lucide-react";
import { AmbassadorApplication, AmbassadorProfile, Coupon, Order } from "@/types";
import { onSnapshot, orderBy } from "firebase/firestore";
import Modal from "@/components/ui/Modal";

export default function AmbassadorTab() {
    const { user, profile } = useAuth();
    const [application, setApplication] = useState<AmbassadorApplication | null>(null);
    const [ambassadorProfile, setAmbassadorProfile] = useState<AmbassadorProfile | null>(null);
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [referralOrders, setReferralOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Form State
    const [applying, setApplying] = useState(false);
    const [formData, setFormData] = useState({
        instagram: "",
        tiktok: "",
        facebook: "",
        notes: ""
    });

    useEffect(() => {
        let unsubscribeOrders: () => void;

        const fetchStatus = async () => {
            if (!user) return;
            try {
                // 1. Check for approved ambassador profile
                const ambRef = collection(db, "ambassadors");
                const ambSnap = await getDocs(query(ambRef, where("uid", "==", user.uid)));

                if (!ambSnap.empty) {
                    const ambData = ambSnap.docs[0].data() as AmbassadorProfile;
                    setAmbassadorProfile(ambData);

                    // Fetch associated coupon
                    const couponRef = collection(db, "coupons");
                    const couponSnap = await getDocs(query(couponRef, where("ambassadorId", "==", user.uid)));

                    if (!couponSnap.empty) {
                        const couponData = couponSnap.docs[0].data() as Coupon;
                        setCoupon(couponData);

                        // REAL-TIME: Listen for referral orders
                        const ordersRef = collection(db, "orders");
                        const ordersQuery = query(
                            ordersRef,
                            where("couponCode", "==", couponData.code),
                            orderBy("createdAt", "desc")
                        );

                        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
                            setReferralOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
                        });
                    }
                } else {
                    // 2. Check for pending application
                    const appRef = collection(db, "ambassador_applications");
                    const appSnap = await getDocs(query(appRef, where("userId", "==", user.uid)));
                    if (!appSnap.empty) {
                        setApplication(appSnap.docs[0].data() as AmbassadorApplication);
                    }
                }
            } catch (err) {
                console.error("Error fetching ambassador status:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        return () => {
            if (unsubscribeOrders) unsubscribeOrders();
        };
    }, [user]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setApplying(true);
        try {
            const appData = {
                userId: user.uid,
                displayName: profile?.displayName || user.email?.split("@")[0] || "Hub Member",
                email: user.email,
                status: "pending",
                appliedAt: serverTimestamp(),
                socialHandles: {
                    instagram: formData.instagram,
                    tiktok: formData.tiktok,
                    facebook: formData.facebook
                },
                notes: formData.notes
            };

            const docRef = await addDoc(collection(db, "ambassador_applications"), appData);
            setApplication({ ...appData, id: docRef.id, appliedAt: new Date() } as any);
            alert("Application Protocols Initialized. Our team will contact you for an interview.");
        } catch (err) {
            console.error("Application error:", err);
            alert("Handshake Failed: Could not submit application.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flyer-red"></div>
            </div>
        );
    }

    // STATE: Approved Ambassador
    if (ambassadorProfile) {
        return (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-flyer-green/5 -rotate-12 translate-x-32 -translate-y-32 rounded-full blur-3xl" />

                    <div className="relative space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-flyer-green/10 rounded-2xl flex items-center justify-center text-flyer-green shadow-sm ring-1 ring-slate-100">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Verified Ambassador</h3>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol V1 Active Since {new Date(ambassadorProfile.joinedAt instanceof Date ? ambassadorProfile.joinedAt : (ambassadorProfile.joinedAt as any).toDate()).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Referral Code</p>
                                <p className="text-3xl font-black text-flyer-red italic tracking-tighter">{coupon?.code || "GENERATING..."}</p>
                                <div className="flex items-center gap-2 pt-2">
                                    <Gift className="w-3 h-3 text-slate-300" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase">5% Automatic Disc.</p>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earnings</p>
                                <p className="text-3xl font-black text-slate-900 italic tracking-tighter">₵ {ambassadorProfile.totalEarnings.toFixed(2)}</p>
                                <div className="flex items-center gap-2 pt-2">
                                    <DollarSign className="w-3 h-3 text-flyer-green" />
                                    <p className="text-[9px] font-black text-flyer-green uppercase">Verified Balance</p>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2 relative group-item">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Tracking</p>
                                <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{referralOrders.length} Uses</p>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3 h-3 text-slate-300" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Accountability Log OK</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAnalysisModal(true)}
                                        className="text-[9px] font-black text-flyer-red uppercase tracking-widest hover:underline"
                                    >
                                        View Analysis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[40px] text-white">
                    <div className="flex items-center gap-4 mb-6">
                        <Star className="w-6 h-6 text-flyer-red" />
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">Rewards Protocol</h4>
                    </div>
                    <ul className="space-y-4 text-white/60 font-bold text-sm italic">
                        <li className="flex gap-3">
                            <span className="text-flyer-red font-black">01 //</span>
                            Every time someone uses your code, you get 2% commission of the order total.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-flyer-red font-black">02 //</span>
                            Commissions are audited every 24 hours.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-flyer-red font-black">03 //</span>
                            Reach 50 referrals to unlock the &quot;Platinum Lead&quot; bonus.
                        </li>
                    </ul>
                </div>

                {/* Impact Log */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Impact Log</h4>
                        <span className="px-3 py-1 bg-flyer-green/10 text-flyer-green text-[9px] font-black rounded-full uppercase tracking-widest animate-pulse">Live Signal</span>
                    </div>

                    <div className="space-y-4">
                        {referralOrders.length > 0 ? referralOrders.map((order) => (
                            <div key={order.id} className="bg-white p-8 rounded-[40px] border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                {order.userName || "Hub Member"}
                                            </p>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate()).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 flex flex-wrap gap-2">
                                            {order.items.map((item, idx) => (
                                                <span key={idx} className="bg-slate-50 px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter border border-slate-100">
                                                    {item.quantity}x {item.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Order Value</p>
                                    <p className="text-xl font-black text-slate-900 italic tracking-tighter leading-none">₵ {order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-50">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No impacts recorded yet. Share your signal.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis Modal */}
                <Modal
                    isOpen={showAnalysisModal}
                    onClose={() => setShowAnalysisModal(false)}
                    title="Coupon Usage Analysis"
                >
                    <div className="space-y-8 py-6">
                        <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Usages</p>
                                <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{referralOrders.length}</p>
                            </div>
                            <Users className="w-12 h-12 text-flyer-red/20" />
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {referralOrders.length > 0 ? referralOrders.map((order, idx) => (
                                <div key={order.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-flyer-red/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{order.userName || "Hub Member"}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                {new Date(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 italic tracking-tighter">₵ {order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs italic">No usage recorded</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowAnalysisModal(false)}
                            className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all"
                        >
                            Close Analysis
                        </button>
                    </div>
                </Modal>
            </div>
        );
    }

    // STATE: Pending or Scheduled Application
    if (application) {
        return (
            <div className="bg-white p-20 text-center rounded-[60px] border-4 border-dashed border-slate-50 animate-in fade-in duration-700">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner group">
                    <Clock className="w-12 h-12 text-slate-200 group-hover:text-flyer-red group-hover:animate-spin transition-all" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
                    {application.status === 'scheduled' ? "Interview Protocol Active" : "Application Under Review"}
                </h3>

                {application.status === 'scheduled' && (application as any).interviewDetails ? (
                    <div className="max-w-md mx-auto mb-10 p-8 bg-flyer-red/5 rounded-[40px] border border-flyer-red/10 space-y-4">
                        <div className="flex items-center justify-center gap-3 text-flyer-red">
                            <Calendar className="w-5 h-5" />
                            <p className="text-sm font-black uppercase tracking-widest leading-none">
                                {new Date((application as any).interviewDetails.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                        </div>
                        {(application as any).interviewDetails.link && (
                            <a
                                href={(application as any).interviewDetails.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-4 bg-white text-slate-900 text-[10px] font-black rounded-2xl uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
                            >
                                Secure Meeting Link
                            </a>
                        )}
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">Attendance is required for protocol verification.</p>
                    </div>
                ) : (
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 max-w-xs mx-auto">
                        We&apos;ve received your application. Our Hub Intelligence team will contact you at <span className="text-flyer-red">{application.email}</span> to schedule your interview.
                    </p>
                )}

                <div className="inline-flex items-center gap-3 px-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status: {application.status.toUpperCase()}
                </div>
            </div>
        );
    }

    // STATE: Open Application Form
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-2 px-4">
                <div className="inline-flex items-center gap-2">
                    <span className="w-6 h-1 bg-flyer-red rounded-full" />
                    <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest italic">Growth Opportunity</p>
                </div>
                <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Coupon Program</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">Join the inner circle. Influence the campus. Earn rewards with your personal coupon.</p>
            </div>

            <form onSubmit={handleApply} className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-50 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                            <Instagram className="w-3 h-3 text-pink-500" />
                            Instagram
                        </label>
                        <input
                            type="text"
                            value={formData.instagram}
                            onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                            className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-sm"
                            placeholder="@username"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                            <Music className="w-3 h-3 text-black" />
                            TikTok
                        </label>
                        <input
                            type="text"
                            value={formData.tiktok}
                            onChange={e => setFormData({ ...formData, tiktok: e.target.value })}
                            className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-sm"
                            placeholder="@username"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                            <Facebook className="w-3 h-3 text-blue-600" />
                            Facebook
                        </label>
                        <input
                            type="text"
                            value={formData.facebook}
                            onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                            className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-sm"
                            placeholder="profile link"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        Why do you want to join?
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        required
                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900 text-sm min-h-[120px] resize-none"
                        placeholder="Tell us about your campus influence..."
                    />
                </div>

                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-flyer-red" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Interview Process Required</p>
                        <p className="text-[9px] font-bold text-slate-500 italic">By applying, you agree to an virtual interview for identity verification and protocol alignment.</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={applying}
                    className="w-full md:w-auto px-16 py-6 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                >
                    {applying ? "Emitting Signal..." : "Transmit Application for Coupon"}
                    <Send className="w-4 h-4 text-flyer-red group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </form>
        </div>
    );
}
