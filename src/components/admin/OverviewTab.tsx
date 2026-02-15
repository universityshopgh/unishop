import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users, ShoppingBag, DollarSign, Package,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Database, Activity, UserCheck, Megaphone, Shield, Check, Loader2, Save
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PromoConfig, FALLBACK_PROMO_CONFIG } from "@/lib/promoUtils";
import { Order, AdminStats } from "@/types";
import PromoSettingsModal from "./PromoSettingsModal";

interface OverviewTabProps {
    stats: AdminStats;
    recentOrders: Order[];
    searchQuery: string;
}

export default function OverviewTab({ stats, recentOrders, searchQuery }: OverviewTabProps) {
    const activeDataPoints = stats.totalOrders + stats.totalProducts + stats.totalUsers;
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [promoEnabled, setPromoEnabled] = useState(false);
    const [couponsEnabled, setCouponsEnabled] = useState(true);
    const [promoConfig, setPromoConfig] = useState<PromoConfig>(FALLBACK_PROMO_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchProtocols();
    }, []);

    const fetchProtocols = async () => {
        setLoading(true);
        try {
            const promoRef = doc(db, "site_config", "promotions");
            const promoSnap = await getDoc(promoRef);
            if (promoSnap.exists()) {
                const data = promoSnap.data() as PromoConfig;
                setPromoConfig(data);
                setPromoEnabled(data.isEnabled);
            }

            const couponRef = doc(db, "site_config", "coupons_global");
            const couponSnap = await getDoc(couponRef);
            if (couponSnap.exists()) {
                setCouponsEnabled(couponSnap.data().isEnabled);
            }
        } catch (err) {
            console.error("Failed to fetch protocol states", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProtocols = async () => {
        setSaving(true);
        try {
            // Update Promo Config
            await setDoc(doc(db, "site_config", "promotions"), {
                ...promoConfig,
                isEnabled: promoEnabled
            });

            // Update Coupon State
            await setDoc(doc(db, "site_config", "coupons_global"), {
                isEnabled: couponsEnabled,
                lastUpdated: new Date().toISOString()
            });

            // Optional: Show success state
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save protocols", err);
            alert("Protocol Handshake Failed. Check logs.");
        } finally {
            setSaving(false);
        }
    };

    // Mutual Exclusivity Logic
    const togglePromo = (val: boolean) => {
        setPromoEnabled(val);
        if (val) setCouponsEnabled(false);
    };

    const toggleCoupons = (val: boolean) => {
        setCouponsEnabled(val);
        if (val) setPromoEnabled(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PromoSettingsModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} />

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Gross Hub Revenue"
                    value={`₵${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<DollarSign className="w-6 h-6" />}
                    trend={`${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend.toFixed(1)}% Uplift`}
                    isPositive={stats.revenueTrend >= 0}
                    color="text-flyer-green"
                />

                {/* Promotions Card - Refactored for Inline Control */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all col-span-1 lg:col-span-1">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Megaphone className="w-16 h-16 text-slate-900" />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol Hub</span>
                        </div>
                        <button
                            onClick={() => setIsPromoModalOpen(true)}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-colors group/edit"
                        >
                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/edit:text-flyer-red" />
                        </button>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {/* Inline Toggles */}
                        <div className="flex flex-col gap-2">
                            <ProtocolToggle
                                label="Site-wide Promo"
                                active={promoEnabled}
                                onClick={() => togglePromo(!promoEnabled)}
                                color="bg-flyer-red"
                            />
                            <ProtocolToggle
                                label="Coupon System"
                                active={couponsEnabled}
                                onClick={() => toggleCoupons(!couponsEnabled)}
                                color="bg-slate-900"
                            />
                        </div>

                        <button
                            onClick={handleSaveProtocols}
                            disabled={saving || loading || saved}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${saved ? 'bg-flyer-green text-white' :
                                saving ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'
                                }`}
                        >
                            {saved ? <Check className="w-3 h-3" /> :
                                saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            {saved ? "Protocol Synced" :
                                saving ? "Syncing..." : "Save Configuration"}
                        </button>
                    </div>
                </div>

                <StatCard
                    title="Hub Citizens"
                    value={stats.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                    trend={`${stats.usersTrend >= 0 ? '+' : ''}${stats.usersTrend.toFixed(1)}% Drift`}
                    isPositive={stats.usersTrend >= 0}
                    color="text-flyer-navy"
                />
                <StatCard
                    title="Gear Inventory"
                    value={stats.totalProducts}
                    icon={<Package className="w-6 h-6" />}
                    trend={`${stats.productsTrend >= 0 ? '+' : ''}${stats.productsTrend.toFixed(1)}% Expansion`}
                    isPositive={stats.productsTrend >= 0}
                    color="text-amber-500"
                />
            </div>

            {/* Data Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
                <div className="lg:col-span-2 bg-white rounded-[60px] p-12 shadow-sm border border-slate-50 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-slate-50" />
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Acquisition Stream</h2>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Real-time hub order execution</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {recentOrders.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-300 text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                                        <th className="pb-6 font-black">Protocol ID</th>
                                        <th className="pb-6 font-black text-center">Citizen</th>
                                        <th className="pb-6 font-black">Value</th>
                                        <th className="pb-6 font-black text-right">Hub Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 mt-4">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="text-sm group/row hover:bg-slate-50 transition-colors">
                                            <td className="py-6 text-slate-900 font-black italic uppercase tracking-tight text-xs">LOG-{order.id.slice(-6).toUpperCase()}</td>
                                            <td className="py-6 font-black text-slate-400 text-[11px] uppercase tracking-widest text-center">{order.userName || "Anonymous"}</td>
                                            <td className="py-6 font-black text-slate-900 text-lg italic tracking-tighter">₵ {order.total.toFixed(2)}</td>
                                            <td className="py-6 text-right">
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ring-1 ring-slate-100 ${order.status === 'delivered'
                                                    ? 'bg-flyer-green/10 text-flyer-green'
                                                    : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-flyer-green' : 'bg-amber-500 animate-pulse'}`} />
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 text-slate-400 font-bold italic">No recent acquisitions detected.</div>
                        )}
                    </div>
                </div>

                <div className="space-y-10">
                    {/* High Performance Banner */}
                    <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group border-[10px] border-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-flyer-red/20 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
                        <TrendingUp className="w-16 h-16 mb-6 text-flyer-red opacity-100 -translate-x-2" />
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none italic ring-1 ring-white/5 inline-block px-4 py-2 rounded-xl">Velocity <span className="text-flyer-red">Spike</span></h3>
                        <p className="text-white/50 text-[11px] font-black uppercase tracking-widest mb-10 leading-relaxed">Intelligence reveals deep acquisition growth. Sales are <span className="text-flyer-green">up {Math.abs(stats.ordersTrend).toFixed(0)}%</span> globally.</p>
                        <button className="w-full bg-white text-slate-900 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95">Generate Intelligence Report</button>
                    </div>

                    {/* Resource Health Section */}
                    <div className="bg-white rounded-[50px] p-10 shadow-sm border border-slate-50 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -translate-y-1/2 translate-x-1/2 rounded-full ring-1 ring-slate-100" />
                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Hub Integrity</h3>
                        <div className="space-y-3">
                            <ResourceMetric label="Active Data Points" value={activeDataPoints.toLocaleString()} color="text-flyer-navy" icon={<Database className="w-4 h-4" />} />
                            <ResourceMetric label="Validated Citizens" value={stats.verifiedUsers.toLocaleString()} color="text-flyer-red" icon={<UserCheck className="w-4 h-4" />} />
                        </div>
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Stock Level</span>
                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">{stats.totalStock} Units</span>
                            </div>
                            <div className="h-4 bg-slate-50 rounded-full border border-slate-100 p-1">
                                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-gradient-to-r from-flyer-navy to-flyer-red rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isPositive, color }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    isPositive: boolean;
    color: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white border border-slate-50 p-10 rounded-[50px] space-y-6 shadow-sm hover:shadow-2xl transition-all duration-500 relative group overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl group-hover:bg-slate-100 transition-colors pointer-events-none" />
            <div className="flex items-start justify-between relative">
                <div className={`p-5 bg-white shadow-xl rounded-[2rem] border border-slate-50 flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-1.5 ring-1 ${isPositive ? 'bg-flyer-green/5 text-flyer-green ring-flyer-green/10' : 'bg-red-50 text-flyer-red ring-red-100'
                    }`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {trend}
                </div>
            </div>
            <div className="relative">
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{title}</p>
                <p className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none">{value}</p>
            </div>
        </motion.div>
    );
}

function ResourceMetric({ label, value, color, icon }: {
    label: string;
    value: string;
    color: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 ${color}`}>
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className={`text-sm font-black italic tracking-tighter ${color}`}>{value}</span>
        </div>
    );
}

function ProtocolToggle({ label, active, onClick, color }: {
    label: string;
    active: boolean;
    onClick: () => void;
    color: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group/toggle"
        >
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{label}</span>
            <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${active ? color : 'bg-slate-200'}`}>
                <motion.div
                    animate={{ x: active ? 16 : 0 }}
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                />
            </div>
        </button>
    );
}
