"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSent, setIsSent] = useState(false);
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send reset link");
            }

            setIsSent(true);
        } catch (err: any) {
            console.error("Reset Error:", err);
            setError(err.message || "Failed to send reset link");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            {/* Background Accents */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flyer-green rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        Recovery Hub
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Identity Verification
                    </p>
                </div>

                {error && (
                    <div className="bg-flyer-red/5 border border-flyer-red/10 text-flyer-red text-xs p-4 rounded-2xl mb-6 font-bold text-center">
                        {error}
                    </div>
                )}

                {!isSent ? (
                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Account Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 flex pl-16 pr-8 text-sm focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-slate-900 text-white font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl uppercase tracking-widest text-xs"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Send Reset Link
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <Link href="/login" className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Return to Access
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-flyer-green/10 text-flyer-green rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            A password reset link has been sent to <br />
                            <span className="text-slate-900 font-black">{email}</span>. <br />
                            Please check your inbox.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                        >
                            Back to Login
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
