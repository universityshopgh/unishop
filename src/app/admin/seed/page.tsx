"use client";

import React, { useState } from "react";
import { initializeDatabase } from "@/lib/seed";
import { CheckCircle2, Database, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSeed = async () => {
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await initializeDatabase();
            setSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to initialize database";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-12 rounded-[40px] shadow-xl border border-slate-200 max-w-md w-full">
                <div className="w-20 h-20 bg-[#c41e3a]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Database className="w-10 h-10 text-[#c41e3a]" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 text-center mb-4">
                    Database <span className="text-[#c41e3a]">Setup</span>
                </h1>

                <p className="text-slate-500 text-center mb-8 font-medium">
                    Initialize your store with sample products and create the admin account.
                </p>

                {success && (
                    <div className="bg-[#90a986]/10 border border-[#90a986]/20 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-[#90a986] flex-shrink-0" />
                            <p className="text-[#90a986] font-bold text-sm">
                                Database initialized successfully!
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 space-y-3 text-xs">
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-[#c41e3a]" />
                                <span className="font-black text-slate-900">Admin Account Created</span>
                            </div>
                            <div className="pl-6 space-y-1 text-slate-600 font-medium">
                                <p><span className="font-bold">Email:</span> universityshop845@gmail.com</p>
                                <p><span className="font-bold">Password:</span> admin1</p>
                                <p><span className="font-bold">Name:</span> Kingsford</p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                <p className="text-red-600 font-bold text-[10px] uppercase tracking-wider">
                                    ⚠️ Change password after first login!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                        <p className="text-red-600 font-bold text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full bg-[#c41e3a] hover:bg-[#a01830] text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-[#c41e3a]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        <>
                            <Database className="w-5 h-5" />
                            Initialize Database
                        </>
                    )}
                </button>

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                    <Link
                        href="/shop"
                        className="text-[#1e293b] font-bold text-sm hover:text-[#c41e3a] transition-colors text-center block"
                    >
                        ← Back to Shop
                    </Link>
                    <Link
                        href="/login"
                        className="text-[#90a986] font-bold text-sm hover:text-[#c41e3a] transition-colors text-center block"
                    >
                        → Login as Admin
                    </Link>
                </div>
            </div>
        </div>
    );
}
