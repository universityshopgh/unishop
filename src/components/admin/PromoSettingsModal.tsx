"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Calendar, Percent, Type, AlertTriangle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PromoConfig, FALLBACK_PROMO_CONFIG } from "@/lib/promoUtils";

interface PromoSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PromoSettingsModal({ isOpen, onClose }: PromoSettingsModalProps) {
    const [config, setConfig] = useState<PromoConfig>(FALLBACK_PROMO_CONFIG);
    const [couponsEnabled, setCouponsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchConfig();
        }
    }, [isOpen]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "site_config", "promotions");
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setConfig(snap.data() as PromoConfig);
            }

            const couponRef = doc(db, "site_config", "coupons_global");
            const couponSnap = await getDoc(couponRef);
            if (couponSnap.exists()) {
                setCouponsEnabled(couponSnap.data().isEnabled);
            }
        } catch (err) {
            console.error("Failed to load promo config", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "site_config", "promotions"), config);
            await setDoc(doc(db, "site_config", "coupons_global"), {
                isEnabled: couponsEnabled,
                lastUpdated: new Date().toISOString()
            });
            onClose();
            // Optional: Trigger a toaster notification
        } catch (err) {
            console.error("Failed to save promo config", err);
            alert("Failed to save settings. Check console.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-50 border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Promo Protocol</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site-wide Campaign Settings</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm font-bold animate-pulse">
                                Syncing Configuration...
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Toggle Switch - Promotion */}
                                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Site-wide Promo</span>
                                        <p className="text-[10px] font-bold text-slate-400">Current Status: {config.isEnabled ? 'ON' : 'OFF'}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newVal = !config.isEnabled;
                                            setConfig({ ...config, isEnabled: newVal });
                                            if (newVal) setCouponsEnabled(false);
                                        }}
                                        className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${config.isEnabled ? 'bg-flyer-red' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${config.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Toggle Switch - Coupons */}
                                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Coupon System</span>
                                        <p className="text-[10px] font-bold text-slate-400">Current Status: {couponsEnabled ? 'ON' : 'OFF'}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newVal = !couponsEnabled;
                                            setCouponsEnabled(newVal);
                                            if (newVal) setConfig({ ...config, isEnabled: false });
                                        }}
                                        className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${couponsEnabled ? 'bg-slate-900' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${couponsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Campaign Name</label>
                                        <div className="relative">
                                            <Type className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="text"
                                                value={config.name}
                                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                                className="w-full bg-slate-50 border-4 border-transparent rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:border-flyer-red/10 focus:outline-none transition-all placeholder:text-slate-300"
                                                placeholder="e.g. Flash Sale"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Discount Percentage</label>
                                        <div className="relative">
                                            <Percent className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="number"
                                                value={config.discountPercent}
                                                onChange={(e) => setConfig({ ...config, discountPercent: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border-4 border-transparent rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:border-flyer-red/10 focus:outline-none transition-all placeholder:text-slate-300"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                value={config.startDate.slice(0, 16)}
                                                onChange={(e) => setConfig({ ...config, startDate: new Date(e.target.value).toISOString() })}
                                                className="w-full bg-slate-50 border-4 border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:border-flyer-red/10 focus:outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">End Date</label>
                                            <input
                                                type="datetime-local"
                                                value={config.endDate.slice(0, 16)}
                                                onChange={(e) => setConfig({ ...config, endDate: new Date(e.target.value).toISOString() })}
                                                className="w-full bg-slate-50 border-4 border-transparent rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:border-flyer-red/10 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-6 rounded-3xl flex gap-4 border-2 border-amber-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/20 rounded-full -translate-x-1/4 -translate-y-1/4 blur-2xl" />
                                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-amber-900 font-black uppercase tracking-widest mb-1">Security Warning</p>
                                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                            Active promotions override all individual ambassador coupons. Users will receive the global discount instead.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? "Syncing..." : "Save Configuration"}
                                    {!saving && <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
