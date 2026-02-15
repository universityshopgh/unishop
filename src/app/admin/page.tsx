"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, Product, UserProfile, AdminStats } from "@/types";
import {
    Users, ShoppingBag, Package,
    Search, Bell, LayoutDashboard, Activity, Star, ShieldCheck, Phone, ArrowRight, Loader2
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatGhanaPhoneNumber, isValidGhanaPhoneNumber } from "@/lib/phoneUtils";
import OverviewTab from "@/components/admin/OverviewTab";
import ProductsTab from "@/components/admin/ProductsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import UsersTab from "@/components/admin/UsersTab";
import AmbassadorManagementTab from "@/components/admin/AmbassadorManagementTab";

export default function AdminDashboard() {
    const { user, profile, isAuthorizedAdmin, isAdminAndUnverified, updateProfileData, emailVerified, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users" | "ambassadors">("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        revenueTrend: 0,
        ordersTrend: 0,
        usersTrend: 0,
        productsTrend: 0,
        totalStock: 0,
        verifiedUsers: 0
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            // Allow if authorized admin OR if unverified admin (the bridge will show)
            if (!isAuthorizedAdmin && !isAdminAndUnverified) {
                router.replace("/");
            }
        }
    }, [isAuthorizedAdmin, isAdminAndUnverified, authLoading, router]);

    // OTP State for Bridge
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSending, setOtpSending] = useState(false);
    const [error, setError] = useState("");
    const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');

    const handleSendOTP = async () => {
        setError("");

        let identifier = "";
        if (channel === 'email') {
            if (!profile?.email) {
                setError("No email address registered to this admin account.");
                return;
            }
            identifier = profile.email;
        } else {
            if (!profile?.phoneNumber) {
                setError("No phone number registered to this admin account.");
                return;
            }
            const formatted = formatGhanaPhoneNumber(profile.phoneNumber);
            if (!isValidGhanaPhoneNumber(formatted)) {
                setError("Invalid phone number format in profile.");
                return;
            }
            identifier = formatted;
        }

        setOtpSending(true);
        try {
            const response = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send',
                    phone: channel !== 'email' ? identifier : undefined,
                    email: channel === 'email' ? identifier : undefined,
                    channel
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Failed to send ${channel.toUpperCase()}`);

            setShowOtpModal(true);
        } catch (err: any) {
            console.error("Admin OTP Error:", err);
            if (err.message === "DEMO_WHITELIST_ERROR" || (err.details === "DEMO_WHITELIST_ERROR")) {
                setError("Notification Restriction: Please ensure this identifier is authorized in your Notification Hub.");
            } else {
                setError(err.message || "Failed to initiate verification");
            }
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return;
        setVerifyingOtp(true);
        setError("");

        try {
            const identifier = channel === 'email' ? profile?.email : formatGhanaPhoneNumber(profile?.phoneNumber || "");
            const verifyResponse = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    phone: channel !== 'email' ? identifier : undefined,
                    email: channel === 'email' ? identifier : undefined,
                    otp,
                    channel
                })
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.error || "Invalid OTP");

            // Update user profile in Firestore
            await updateProfileData({
                phoneVerified: true
            });

            setShowOtpModal(false);
        } catch (err: any) {
            setError(err.message || "Verification failed");
        } finally {
            setVerifyingOtp(false);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                const ordersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
                const productsSnap = await getDocs(collection(db, "products"));

                const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                const totalSales = ordersData.reduce((sum, order) => sum + order.total, 0);

                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

                const getTS = (val: any) => val?.seconds ? val.seconds * 1000 : new Date(val).getTime();

                const currentMonthRevenue = ordersData
                    .filter(o => getTS(o.createdAt) > thirtyDaysAgo.getTime())
                    .reduce((sum, o) => sum + o.total, 0);
                const lastMonthRevenue = ordersData
                    .filter(o => getTS(o.createdAt) <= thirtyDaysAgo.getTime() && getTS(o.createdAt) > sixtyDaysAgo.getTime())
                    .reduce((sum, o) => sum + o.total, 0);

                const currentMonthOrders = ordersData.filter(o => getTS(o.createdAt) > thirtyDaysAgo.getTime()).length;
                const lastMonthOrders = ordersData.filter(o => getTS(o.createdAt) <= thirtyDaysAgo.getTime() && getTS(o.createdAt) > sixtyDaysAgo.getTime()).length;

                const usersData = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
                const currentMonthUsers = usersData.filter(u => getTS(u.createdAt) > thirtyDaysAgo.getTime()).length;
                const lastMonthUsers = usersData.filter(u => getTS(u.createdAt) <= thirtyDaysAgo.getTime() && getTS(u.createdAt) > sixtyDaysAgo.getTime()).length;
                const verifiedUsers = usersData.filter(u => u.phoneVerified || u.role === 'admin').length;

                const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                const currentMonthProducts = productsData.filter(p => getTS(p.createdAt) > thirtyDaysAgo.getTime()).length;
                const lastMonthProducts = productsData.filter(p => getTS(p.createdAt) <= thirtyDaysAgo.getTime() && getTS(p.createdAt) > sixtyDaysAgo.getTime()).length;
                const totalStock = productsData.reduce((sum, p) => sum + (p.stock || 0), 0);

                const calcTrend = (curr: number, prev: number) => {
                    if (prev === 0) return curr > 0 ? 100 : 0;
                    return ((curr - prev) / prev) * 100;
                };

                setStats({
                    totalUsers: usersSnap.size,
                    totalSales: totalSales,
                    totalOrders: ordersSnap.size,
                    totalProducts: productsSnap.size,
                    revenueTrend: calcTrend(currentMonthRevenue, lastMonthRevenue),
                    ordersTrend: calcTrend(currentMonthOrders, lastMonthOrders),
                    usersTrend: calcTrend(currentMonthUsers, lastMonthUsers),
                    productsTrend: calcTrend(currentMonthProducts, lastMonthProducts),
                    totalStock, // New real stat
                    verifiedUsers // New real stat
                });

                setOrders(ordersData);
                setProducts(productsData);
                setUsers(usersData);

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorizedAdmin) fetchAllData();
    }, [isAuthorizedAdmin]);

    if (authLoading || (loading && isAuthorizedAdmin)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-flyer-red"></div>
            </div>
        );
    }

    // Interstitial Bridge for Unverified Admins
    if (isAdminAndUnverified) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flyer-green rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-lg relative z-10">
                    <div className="text-center mb-10 space-y-4">
                        <div className="w-20 h-20 bg-slate-900 text-white font-black rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-900/20">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                            Admin <span className="text-flyer-red">Verification</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Security Protocols Active</p>
                    </div>

                    <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-flyer-red px-2">Verification Protocol</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setChannel('sms')}
                                    className={`h-12 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-wider ${channel === 'sms' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                >
                                    SMS
                                </button>
                                <button
                                    onClick={() => setChannel('whatsapp')}
                                    className={`h-12 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-wider ${channel === 'whatsapp' ? 'bg-[#25D366] border-[#25D366] text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                >
                                    WA
                                </button>
                                <button
                                    onClick={() => setChannel('email')}
                                    className={`h-12 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-wider ${channel === 'email' ? 'bg-flyer-red border-flyer-red text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                >
                                    Mail
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-flyer-red/10 flex items-center justify-center">
                                    {channel === 'email' ? <Bell className="w-6 h-6 text-flyer-red" /> : <Phone className="w-6 h-6 text-flyer-red" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Target Identity</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tight italic">
                                        {channel === 'email' ? profile?.email : (profile?.phoneNumber || "No ID Set")}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                To access the Central Intelligence hub, you must verify your identity via the selected protocol.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-flyer-red/5 border border-flyer-red/10 text-flyer-red text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSendOTP}
                            disabled={otpSending || !profile?.phoneNumber}
                            className="w-full h-20 bg-slate-900 text-white font-black rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-slate-900/20 overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            {otpSending ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Verify Identity Protocol
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-flyer-red transition-colors"
                        >
                            Decline & Return to Civil Sector
                        </button>
                    </div>
                </div>

                {/* OTP Verification Modal */}
                <Modal
                    isOpen={showOtpModal}
                    onClose={() => !verifyingOtp && setShowOtpModal(false)}
                    title="Authority Validation"
                >
                    <div className="p-10 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-flyer-red/10 text-flyer-red rounded-2xl flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Enter Auth Code</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto">
                                Authorization request sent to {profile?.phoneNumber}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 rounded-3xl py-6 text-center text-3xl font-black tracking-[0.5em] text-slate-900 focus:outline-none"
                                placeholder="000000"
                            />

                            {error && (
                                <p className="text-[10px] font-black text-flyer-red uppercase tracking-widest text-center">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp || otp.length !== 6}
                                className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            >
                                {verifyingOtp ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Authorize Access
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-flyer-light pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
                {/* Header Branding */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-12 bg-white rounded-[50px] shadow-sm border border-slate-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-flyer-red/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl pointer-events-none group-hover:bg-flyer-red/10 transition-colors" />
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <div className="h-2 w-12 bg-flyer-red rounded-full" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">Central <span className="text-flyer-red">Intelligence</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Hub Protocol Active • Authenticated as <span className="text-slate-900 underline underline-offset-4">{profile?.displayName || "Admin User"}</span></p>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <div className="relative group/search">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/search:text-flyer-red transition-colors" />
                            <input
                                placeholder="Audit logs, users, gear..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border-2 border-transparent focus:border-flyer-red/20 rounded-3xl pl-16 pr-8 py-5 text-sm font-black text-slate-900 focus:outline-none w-full md:w-80 shadow-inner transition-all"
                            />
                        </div>
                        <button className="p-5 bg-white border-2 border-slate-50 rounded-3xl text-slate-300 hover:text-flyer-red hover:shadow-xl transition-all relative group">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-4 right-4 w-3 h-3 bg-flyer-red rounded-full ring-4 ring-white animate-pulse" />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Activity className="w-5 h-5" />} label="Overview" />
                    <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")} icon={<Package className="w-5 h-5" />} label="Products" />
                    <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<ShoppingBag className="w-5 h-5" />} label="Orders" />
                    <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users className="w-5 h-5" />} label="Citizens" />
                    <TabButton active={activeTab === "ambassadors"} onClick={() => setActiveTab("ambassadors")} icon={<Star className="w-5 h-5" />} label="Ambassadors" />
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === "overview" && <OverviewTab stats={stats} recentOrders={orders.slice(0, 5)} searchQuery={searchQuery} />}
                    {activeTab === "products" && <ProductsTab initialProducts={products} searchQuery={searchQuery} />}
                    {activeTab === "orders" && <OrdersTab orders={orders} searchQuery={searchQuery} />}
                    {activeTab === "users" && <UsersTab users={users} searchQuery={searchQuery} />}
                    {activeTab === "ambassadors" && <AmbassadorManagementTab searchQuery={searchQuery} />}
                </div>
            </div>
        </div>
    );
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all whitespace-nowrap ${active
                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105"
                : "bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-50"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
