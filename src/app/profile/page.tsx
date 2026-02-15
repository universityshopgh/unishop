"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, Timestamp, limit, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { User, Package, Settings, LogOut, ChevronRight, Calendar, ShoppingBag, ShieldCheck, ArrowRight, MapPin, Phone, Lock, CheckCircle2, AlertCircle, Star, Loader2 } from "lucide-react";
import { Order, UserProfile } from "@/types";
import Link from "next/link";
import AmbassadorTab from "@/components/profile/AmbassadorTab";
import Modal from "@/components/ui/Modal";
import { formatGhanaPhoneNumber, isValidGhanaPhoneNumber } from "@/lib/phoneUtils";

export default function ProfilePage() {
    const { user, profile, loading, isAdmin, isAuthorizedAdmin, isAdminAndUnverified, updateProfileData, updateUserPassword, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [globalStats, setGlobalStats] = useState({ totalOrders: 0, totalUsers: 0 });
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<"orders" | "settings" | "ambassador">(
        (tabParam === 'ambassador' || tabParam === 'settings') ? tabParam : "orders"
    );

    // Profile Edit State
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [editData, setEditData] = useState({
        displayName: profile?.displayName || "",
        phoneNumber: profile?.phoneNumber || "",
        address: profile?.address || ""
    });

    // Password State
    const [passLoading, setPassLoading] = useState(false);
    const [passSuccess, setPassSuccess] = useState("");
    const [passError, setPassError] = useState("");
    const [passData, setPassData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });



    const router = useRouter();

    useEffect(() => {
        if (profile) {
            setEditData({
                displayName: profile.displayName || "",
                phoneNumber: profile.phoneNumber || "",
                address: profile.address || ""
            });
        }
    }, [profile]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        setOrdersLoading(true);
        let unsubscribe: () => void = () => { };

        try {
            if (isAdmin) {
                // Fetch global stats once (still async)
                const fetchStats = async () => {
                    const usersSnap = await getDocs(collection(db, "users"));
                    setGlobalStats(prev => ({ ...prev, totalUsers: usersSnap.size }));
                };
                fetchStats();

                // Real-time listener for global orders summary
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20));
                unsubscribe = onSnapshot(q, (snapshot) => {
                    const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
                    setOrders(newOrders);
                    setGlobalStats(prev => ({ ...prev, totalOrders: snapshot.size }));
                    setOrdersLoading(false);
                }, (err) => {
                    console.error("Order snapshot error:", err);
                    setOrdersLoading(false);
                });
            } else {
                // Standard user real-time order listener
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                unsubscribe = onSnapshot(q, (snapshot) => {
                    setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
                    setOrdersLoading(false);
                }, (err) => {
                    console.error("User order snapshot error:", err);
                    setOrdersLoading(false);
                });
            }
        } catch (error) {
            console.error("Error setting up order tracking:", error);
            setOrdersLoading(false);
        }

        return () => unsubscribe();
    }, [user, isAdmin]);

    const handleSignOut = async () => {
        await logout();
        router.push("/");
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError("");
        setUpdateSuccess("");

        try {
            await updateProfileData(editData);
            setUpdateSuccess("Hub information secured successfully!");
        } catch (err: any) {
            setUpdateError(err.message || "Failed to update hub info");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            setPassError("Passwords do not match");
            return;
        }

        if (passData.newPassword.length < 6) {
            setPassError("New password must be at least 6 characters long");
            return;
        }

        setPassLoading(true);
        setPassError("");
        setPassSuccess("");

        try {
            await updateUserPassword(passData.currentPassword, passData.newPassword);
            setPassSuccess("Identity protocols updated successfully!");
            setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            console.error("Password update error:", err);
            if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
                setPassError("The current password provided is incorrect. Please try again.");
            } else if (err.code === "auth/too-many-requests") {
                setPassError("Too many failed attempts. Please try again later.");
            } else if (err.code === "auth/weak-password") {
                setPassError("The new password is too weak.");
            } else {
                setPassError("Failed to update password. Please check your connection and try again.");
            }
        } finally {
            setPassLoading(false);
        }
    };



    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-flyer-red"></div>
            </div>
        );
    }

    return (
        <div className="bg-flyer-light min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* HUB Sidebar - Flyer Style */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-white p-12 rounded-[50px] shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-flyer-red/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl pointer-events-none group-hover:bg-flyer-red/10 transition-colors" />

                            <div className="flex flex-col items-center space-y-8 relative">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-slate-900 border-[8px] border-white shadow-2xl flex items-center justify-center text-5xl font-black text-white italic tracking-tighter shadow-slate-300">
                                    {profile?.displayName?.[0] || user.email?.[0].toUpperCase()}
                                </div>
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                                        {profile?.displayName || "Hub User"}
                                    </h1>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{user.email}</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-[9px] font-black uppercase tracking-widest mt-4 ${user.emailVerified || user.email === "universityshop845@gmail.com" ? 'bg-flyer-green/10 border-flyer-green/10 text-flyer-green' : 'bg-flyer-red/10 border-flyer-red/10 text-flyer-red'}`}>
                                        <ShieldCheck className="w-3 h-3" />
                                        {(user.emailVerified || user.email === "universityshop845@gmail.com") ? 'Verified Hub Member' : 'Unverified Identity'}
                                    </div>
                                    {profile?.role === 'ambassador' && (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-flyer-red/10 border border-flyer-red/10 rounded-full text-[9px] font-black text-flyer-red uppercase tracking-widest mt-2">
                                            <Star className="w-3 h-3 fill-current" />
                                            Elite Ambassador
                                        </div>
                                    )}
                                </div>
                            </div>

                            <nav className="space-y-3 pt-12 border-t border-slate-50 mt-12">
                                <button
                                    onClick={() => setActiveTab("orders")}
                                    className={`w-full flex items-center justify-between px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all ${activeTab === "orders" ? "bg-slate-900 text-white shadow-slate-900/10" : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-none border border-slate-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Package className={`w-4 h-4 ${activeTab === "orders" ? "text-flyer-red" : "group-hover:text-flyer-red"}`} />
                                        {isAdmin ? "Global Audit" : "Hub Orders"}
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTab("ambassador")}
                                    className={`w-full flex items-center justify-between px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all ${activeTab === "ambassador" ? "bg-slate-900 text-white shadow-slate-900/10" : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-none border border-slate-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Star className={`w-4 h-4 ${activeTab === "ambassador" ? "text-flyer-red" : "group-hover:text-flyer-red"}`} />
                                        {profile?.role === 'ambassador' ? "Ambassador Dash" : "Ambassador Program"}
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={`w-full flex items-center justify-between px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all ${activeTab === "settings" ? "bg-slate-900 text-white shadow-slate-900/10" : "bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-none border border-slate-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Settings className={`w-4 h-4 ${activeTab === "settings" ? "text-flyer-red" : "group-hover:text-flyer-red"}`} />
                                        Hub Settings
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <div className="pt-6 border-t border-slate-50 mt-6 md:hidden lg:block">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl bg-red-50 text-flyer-red font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-flyer-red hover:text-white"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Disconnect
                                    </button>
                                </div>
                            </nav>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[40px] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                            <ShieldCheck className="w-16 h-16 absolute -bottom-4 -right-4 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 leading-none">Security Protocol</h3>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-6">Admin Intelligence Active</p>

                            {isAuthorizedAdmin ? (
                                <Link href="/admin" className="inline-flex items-center gap-2 px-8 py-3 bg-flyer-red text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:scale-105 transition-all outline-none">
                                    Dashboard Home
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            ) : isAdminAndUnverified ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-flyer-red/10 border border-flyer-red/20 rounded-2xl">
                                        <p className="text-[10px] font-black text-flyer-red uppercase tracking-widest leading-loose">
                                            Priority: High. Email verification required to unlock administrative capabilities.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Handle sending verification email if needed
                                            // For now, it's handled by Firebase automatically or on login
                                            alert("Check your email to verify your account.");
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-flyer-red text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-flyer-red/20"
                                    >
                                        Resend Verification
                                        <ShieldCheck className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                        Standard Hub Access Level
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-8 space-y-16">
                        {activeTab === "orders" ? (
                            <>
                                {/* Stats Dashboard */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-50 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-full bg-slate-50/50 -rotate-12 translate-x-12 group-hover:translate-x-0 transition-transform duration-700 pointer-events-none" />
                                        <div className="space-y-2 relative">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isAdmin ? "Total Platform Sales" : "Successful Hub Transactions"}</p>
                                            <p className="text-6xl font-black text-slate-900 italic tracking-tighter leading-none">{isAdmin ? globalStats.totalOrders : orders.length}</p>
                                            <div className="pt-4 flex items-center gap-2">
                                                <span className="w-8 h-1 bg-flyer-red rounded-full" />
                                                <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest italic">{isAdmin ? "Global Revenue Metrics" : "Hub Activity Tracking"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-50 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-full bg-flyer-green/5 -rotate-12 translate-x-12 group-hover:translate-x-0 transition-transform duration-700 pointer-events-none" />
                                        <div className="space-y-2 relative">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isAdmin ? "Registered Hub Members" : "Hub Credibility Status"}</p>
                                            <p className="text-6xl font-black text-flyer-green italic tracking-tighter leading-none uppercase">{isAdmin ? globalStats.totalUsers : "Solid"}</p>
                                            <div className="pt-4 flex items-center gap-2">
                                                <span className="w-8 h-1 bg-flyer-green rounded-full" />
                                                <p className="text-[9px] font-black text-flyer-green uppercase tracking-widest italic">{isAdmin ? "Member Base Tracking" : "Identity Protected"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders List */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end px-4">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="w-6 h-1 bg-flyer-red rounded-full" />
                                                <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest italic">{isAdmin ? "Platform Audit" : "Audit Logs"}</p>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{isAdmin ? "System Audit Log" : "Recent Hub Activity"}</h2>
                                        </div>
                                        <Link
                                            href={isAdmin ? "/admin?tab=orders" : "/shop"}
                                            className="text-[10px] font-black text-flyer-red uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-flyer-red transition-all pb-2 italic"
                                        >
                                            {isAdmin ? "Full Audit Access" : "Secure New Gear"}
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        {ordersLoading ? (
                                            <div className="space-y-6">
                                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-slate-50 animate-pulse rounded-[32px]" />)}
                                            </div>
                                        ) : orders.length > 0 ? (
                                            <div className="space-y-4">
                                                {orders.map((order) => {
                                                    const statusColors = {
                                                        pending: "bg-amber-50 text-amber-600 border-amber-100",
                                                        processing: "bg-blue-50 text-blue-600 border-blue-100",
                                                        ready_for_pickup: "bg-indigo-50 text-indigo-600 border-indigo-100",
                                                        shipped: "bg-purple-50 text-purple-600 border-purple-100",
                                                        delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
                                                        cancelled: "bg-red-50 text-red-600 border-red-100"
                                                    };

                                                    const currentStatus = order.status || 'pending';
                                                    const colorClass = statusColors[currentStatus as keyof typeof statusColors] || statusColors.pending;

                                                    return (
                                                        <motion.div
                                                            key={order.id}
                                                            initial={{ opacity: 0, scale: 0.98 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setShowOrderModal(true);
                                                            }}
                                                            className="bg-white p-6 sm:p-8 rounded-[40px] flex flex-col sm:flex-row items-start sm:items-center justify-between group cursor-pointer border-2 border-transparent hover:border-flyer-red/10 hover:shadow-2xl transition-all duration-500 gap-6"
                                                        >
                                                            <div className="flex items-center gap-6 sm:gap-8">
                                                                <div className="relative">
                                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-flyer-red group-hover:text-white transition-all shadow-sm ring-1 ring-slate-100 overflow-hidden">
                                                                        {order.items && order.items[0]?.image ? (
                                                                            <img src={order.items[0].image} alt="item" className="w-full h-full object-cover p-2 group-hover:p-0 transition-all" />
                                                                        ) : (
                                                                            <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                                                                        )}
                                                                        {order.items && order.items.length > 1 && (
                                                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-900 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white ring-1 ring-slate-100">
                                                                                +{order.items.length - 1}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                        Ref: #{order.orderId?.toUpperCase() || order.id.slice(-6).toUpperCase()}
                                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                                                                    </p>
                                                                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3 group-hover:text-flyer-red transition-colors">
                                                                        {order.items?.[0]?.name || "UniShop Goods"}
                                                                    </h4>

                                                                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                                                                        <span className="flex items-center gap-1.5 text-slate-400">
                                                                            <Calendar className="w-3.5 h-3.5 text-flyer-red" />
                                                                            {order.createdAt instanceof Timestamp ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                        <span className={`px-4 py-1.5 rounded-full border ${colorClass} transition-all`}>
                                                                            {currentStatus.replace(/_/g, ' ')}
                                                                        </span>
                                                                        {order.paymentStatus === 'paid' && (
                                                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center gap-1">
                                                                                <CheckCircle2 className="w-3 h-3" />
                                                                                Paid
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-8 sm:gap-12 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 border-slate-50">
                                                                <div>
                                                                    <p className="text-3xl sm:text-4xl font-black text-slate-900 italic tracking-tighter leading-none">₵{order.total.toFixed(2)}</p>
                                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 italic text-right">Hub Cleared</p>
                                                                </div>
                                                                <div className="w-12 h-12 rounded-full border-2 border-slate-50 flex items-center justify-center group-hover:border-flyer-red group-hover:bg-flyer-red/5 transition-all shadow-sm">
                                                                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-flyer-red transition-all" />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="bg-white p-20 text-center rounded-[60px] border-4 border-dashed border-slate-50">
                                                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner group overflow-hidden">
                                                    <Package className="w-12 h-12 text-slate-200" />
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">No Transaction Data</h3>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 max-w-xs mx-auto">Your hub history is empty. Time to secure some gear!</p>
                                                <Link href="/shop" className="px-12 py-5 bg-flyer-red text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl shadow-flyer-red/30 hover:scale-105 transition-all inline-flex items-center gap-3">
                                                    Initiate Shopping
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "settings" ? (
                            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Hub Information */}
                                <div className="space-y-10">
                                    <div className="space-y-2 px-4">
                                        <div className="inline-flex items-center gap-2">
                                            <span className="w-6 h-1 bg-flyer-red rounded-full" />
                                            <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest italic">Identity Control</p>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Hub Information</h2>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-50 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                                                    <User className="w-3 h-3" />
                                                    Display Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editData.displayName}
                                                    onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                                                    className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900"
                                                    placeholder="Enter name"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" />
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={editData.phoneNumber}
                                                    onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })}
                                                    className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900"
                                                    placeholder="Enter phone"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                Delivery Address
                                            </label>
                                            <textarea
                                                value={editData.address}
                                                onChange={e => setEditData({ ...editData, address: e.target.value })}
                                                className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900 min-h-[120px] resize-none"
                                                placeholder="Enter full address"
                                            />
                                        </div>

                                        {updateError && (
                                            <div className="p-5 rounded-2xl bg-red-50 text-flyer-red text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4" />
                                                {updateError}
                                            </div>
                                        )}

                                        {updateSuccess && (
                                            <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {updateSuccess}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-6">
                                            <button
                                                type="submit"
                                                disabled={updateLoading}
                                                className="px-12 py-5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-flyer-red transition-all flex items-center gap-3 disabled:opacity-50"
                                            >
                                                {updateLoading ? "Securing Hub..." : "Save Identity Info"}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Security Protocols */}
                                <div className="space-y-10">
                                    <div className="space-y-2 px-4">
                                        <div className="inline-flex items-center gap-2">
                                            <span className="w-6 h-1 bg-flyer-red rounded-full" />
                                            <p className="text-[10px] font-black text-flyer-red uppercase tracking-widest italic">Auth Protocol</p>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Security Center</h2>
                                    </div>

                                    {user?.providerData[0]?.providerId === "google.com" ? (
                                        <div className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-50 text-center space-y-6">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.249 C -21.864 50.459 -21.734 49.689 -21.484 48.969 L -25.464 45.879 L -25.464 48.969 C -26.284 50.599 -26.754 52.429 -26.754 54.379 C -26.754 56.329 -26.284 58.159 -25.464 59.789 L -21.484 53.529 Z" />
                                                        <path fill="#EA4335" d="M -14.754 44.009 C -12.984 44.009 -11.424 44.619 -10.174 45.809 L -6.714 42.349 C -8.804 40.409 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.879 L -21.484 48.969 C -20.534 46.119 -17.884 44.009 -14.754 44.009 Z" />
                                                    </g>
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Google Account Managed</h3>
                                            <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto">
                                                Your security is managed by Google. You cannot rotate your password here because you are signed in via your Google Account.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleUpdatePassword} className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-50 space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                                                    <Lock className="w-3 h-3" />
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passData.currentPassword}
                                                    onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
                                                    className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passData.newPassword}
                                                        onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                                                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                                                        <Lock className="w-3 h-3" />
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passData.confirmPassword}
                                                        onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                                                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 focus:bg-white transition-all outline-none font-bold text-slate-900"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>

                                            {passError && (
                                                <div className="p-5 rounded-2xl bg-red-50 text-flyer-red text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {passError}
                                                </div>
                                            )}

                                            {passSuccess && (
                                                <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {passSuccess}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={passLoading}
                                                className="px-12 py-5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-flyer-red transition-all flex items-center gap-3 disabled:opacity-50"
                                            >
                                                {passLoading ? "Updating Identity..." : "Rotate Passkey"}
                                                <ShieldCheck className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <AmbassadorTab />
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Mission Outcome: Package Receipt">
                {selectedOrder && (
                    <div className="space-y-12 py-6">
                        {/* Status Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Identified Protocol</p>
                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">#{selectedOrder.orderId?.toUpperCase() || selectedOrder.id.slice(-8).toUpperCase()}</h3>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                    {selectedOrder.status.replace(/_/g, ' ')}
                                </span>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{selectedOrder.paymentStatus === 'paid' ? 'Transaction Finalized' : 'Payment Awaited'}</p>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2 flex items-center gap-3">
                                <span className="w-8 h-px bg-slate-200" />
                                Secured Manifest
                                <span className="w-full h-px bg-slate-200" />
                            </h4>
                            <div className="space-y-4">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-flyer-red/20 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 p-2 overflow-hidden border border-slate-100 group-hover:bg-white transition-colors">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{item.name}</h5>
                                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span className="text-flyer-red">₵{item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right sm:block hidden">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Tracking ID</p>
                                            <p className="text-[10px] font-black text-slate-900 uppercase tabular-nums bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 italic">
                                                {item.trackingId || 'HUB-PENDING'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Destination */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Drop Location</h4>
                                <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 relative group overflow-hidden h-full">
                                    <MapPin className="w-12 h-12 absolute -bottom-2 -right-2 text-slate-200/50 group-hover:scale-110 transition-transform" />
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest leading-loose relative">
                                        {selectedOrder.shippingAddress || selectedOrder.address || "N/A"}
                                    </p>
                                    <p className="text-[9px] font-black text-flyer-red uppercase tracking-widest mt-4 flex items-center gap-2">
                                        <Phone className="w-3 h-3" />
                                        {selectedOrder.phone || "No Registry Link"}
                                    </p>
                                </div>
                            </div>

                            {/* Financial Analytics */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 text-right">Transaction Analytics</h4>
                                <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4 relative overflow-hidden group h-full">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-flyer-red/10 rounded-full blur-3xl pointer-events-none group-hover:bg-flyer-red/20 transition-colors" />
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/50">
                                        <span>Subtotal Hub</span>
                                        <span className="tabular-nums">₵{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/50">
                                        <span>Shipping Protocol</span>
                                        <span className="text-flyer-green">Free Deployment</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-flyer-red">Grand Total</span>
                                        <span className="text-4xl font-black italic tracking-tighter tabular-nums">₵{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Progression */}
                        <div className="space-y-6 pt-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Progression</h4>
                            <div className="flex justify-between relative px-2">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-flyer-red -translate-y-1/2 rounded-full transition-all duration-1000"
                                    style={{
                                        width:
                                            selectedOrder.status === 'delivered' ? '100%' :
                                                selectedOrder.status === 'shipped' ? '75%' :
                                                    selectedOrder.status === 'ready_for_pickup' ? '50%' :
                                                        selectedOrder.status === 'processing' ? '25%' : '5%'
                                    }}
                                />
                                {['pending', 'processing', 'ready', 'delivered'].map((step, idx) => (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all duration-500 ${(idx === 0) ||
                                            (idx === 1 && ['processing', 'ready_for_pickup', 'shipped', 'delivered'].includes(selectedOrder.status)) ||
                                            (idx === 2 && ['ready_for_pickup', 'shipped', 'delivered'].includes(selectedOrder.status)) ||
                                            (idx === 3 && selectedOrder.status === 'delivered')
                                            ? 'bg-flyer-red scale-110 shadow-flyer-red/20' : 'bg-slate-200'
                                            }`}>
                                            {idx === 3 ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-1 h-1 bg-white rounded-full" />}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowOrderModal(false)}
                            className="w-full py-6 bg-slate-50 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] rounded-[30px] border border-slate-100 hover:bg-slate-900 hover:text-white transition-all active:scale-95 mt-4"
                        >
                            Deactivate Receipt View
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
