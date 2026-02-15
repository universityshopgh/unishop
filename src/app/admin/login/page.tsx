"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight, Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const { refreshProfile } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Strict Check: ONLY this email is allowed
            if (user.email !== "universityshop845@gmail.com") {
                await signOut(auth);
                throw new Error("Access Denied: You are not authorized to access this portal.");
            }

            if (!user.emailVerified) {
                await signOut(auth);
                throw new Error("Admin email not verified. Please verify your email first.");
            }

            const userProfile = await userService.getUserProfile(user.uid);
            if (!userProfile) {
                await signOut(auth);
                throw new Error("Access Denied: User profile not found.");
            }

            if (userProfile.role !== "admin") {
                await signOut(auth);
                throw new Error("Access Denied: Insufficient permissions.");
            }

            await refreshProfile();
            router.push("/admin");
        } catch (err: any) {
            console.error("Admin Login Error:", err);
            setError(err.message || "Failed to sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 mesh-gradient-dark relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10 space-y-4">
                    <div className="w-20 h-20 bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-black/50 ring-4 ring-slate-900/50">
                        <Shield className="w-10 h-10 text-flyer-red" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                            Admin <span className="text-flyer-red">Portal</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            Restricted Access Area
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[40px] border border-slate-800 shadow-2xl shadow-black/50">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl mb-8 font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Admin Email</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-flyer-red transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl py-5 flex pl-16 pr-8 text-sm focus:outline-none focus:bg-slate-900 focus:border-flyer-red/50 transition-all font-bold text-white placeholder:text-slate-700"
                                    placeholder="admin@unishop.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-flyer-red transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl py-5 flex pl-16 pr-8 text-sm focus:outline-none focus:bg-slate-900 focus:border-flyer-red/50 transition-all font-bold text-white placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full h-18 bg-white text-slate-900 font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/10 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-black/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Authenticate
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/" className="text-xs font-black text-slate-600 hover:text-white transition-all uppercase tracking-widest group">
                        <span className="group-hover:mr-2 transition-all">←</span> Back to Store
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
