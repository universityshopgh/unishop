"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/services/userService";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, MailCheck, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const router = useRouter();
    const { refreshProfile } = useAuth();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!termsAccepted) {
            setError("You must agree to the Terms of Service and Privacy Policy");
            return;
        }

        setLoading(true);
        setUnverifiedEmail(null);

        try {
            let loginEmail = email;
            const isEmailPrefix = email.includes("@");

            if (!isEmailPrefix) {
                // Handle Username Login via Service
                const profile = await userService.getUserByUsername(email);
                if (!profile) {
                    throw new Error("Account not found. Try logging in with your Email address.");
                }
                loginEmail = profile.email!;
            }
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
            const user = userCredential.user;

            // Check if user exists in Firestore FIRST
            let userProfile = await userService.getUserProfile(user.uid);

            // GHOST USER RECONCILIATION: If user exists in Auth but MISSING in Firestore, recreate profile
            if (!userProfile) {
                console.log("Ghost user detected during login. Reconciling profile...");
                userProfile = {
                    uid: user.uid,
                    displayName: user.displayName || email.split('@')[0],
                    email: user.email!,
                    username: email.split('@')[0] + "_" + Math.floor(Math.random() * 1000),
                    role: "customer",
                    createdAt: new Date(),
                    photoURL: user.photoURL,
                    phoneNumber: "",
                    phoneVerified: false
                };

                // Ensure unique username for the restored profile
                const isAvailable = await userService.isUsernameAvailable(userProfile.username);
                if (!isAvailable) {
                    userProfile.username = `${userProfile.username}${Math.floor(Math.random() * 100)}`;
                }

                await userService.createUserAccount(userProfile);
            }

            // Only check email verification if the user exists in the database
            if (!user.emailVerified && user.email !== "universityshop845@gmail.com") {
                setUnverifiedEmail(user.email);
                await signOut(auth);
                throw new Error("Email not verified");
            }

            // Redirect based on role
            if (userProfile.role === "admin" || user.email === "universityshop845@gmail.com") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to sign in";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        if (!termsAccepted) {
            setError("You must agree to the Terms of Service and Privacy Policy");
            return;
        }

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            let userProfile = await userService.getUserProfile(user.uid);

            if (!userProfile) {
                userProfile = {
                    uid: user.uid,
                    displayName: user.displayName || "Google User",
                    email: user.email!,
                    username: user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`,
                    role: "customer",
                    createdAt: new Date(),
                    photoURL: user.photoURL,
                    phoneNumber: "",
                    phoneVerified: false
                };

                const isAvailable = await userService.isUsernameAvailable(userProfile.username);
                if (!isAvailable) {
                    userProfile.username = `${userProfile.username}_${Math.floor(Math.random() * 1000)}`;
                }

                await userService.createUserAccount(userProfile);
            }

            if (userProfile && (userProfile.role === "admin" || user.email === "universityshop845@gmail.com")) {
                router.push("/admin");
            } else {
                router.push("/");
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to sign in with Google";
            setError(message);
        }
    };

    const handleResendVerification = async () => {
        if (!unverifiedEmail) return;
        setError("Please check your email. Verification link was sent during registration.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 mesh-gradient bg-white">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flyer-green rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-flyer-red text-white font-black rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-flyer-red/20 text-2xl">
                        U
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                        Welcome <span className="text-flyer-red italic">Back</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your hub essentials await</p>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    {error && (
                        <div className={`text-xs p-4 rounded-2xl mb-8 font-bold text-center border ${unverifiedEmail ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-flyer-red/5 border-flyer-red/10 text-flyer-red'}`}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                {unverifiedEmail ? <MailCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {error}
                            </div>
                            {unverifiedEmail && (
                                <button
                                    onClick={handleResendVerification}
                                    className="block mx-auto mt-2 text-[10px] uppercase tracking-widest text-amber-700 hover:underline"
                                >
                                    Resend Verification Link
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-flyer-red px-2">Account Email or Username</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 flex pl-16 pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                    placeholder="Email or Username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-flyer-red">Password</label>
                                <Link href="/forgot-password" className="text-[10px] font-black text-slate-400 hover:text-flyer-red uppercase tracking-widest">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 flex pl-16 pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox - Inside Form */}
                        <div
                            className="flex items-start gap-3 p-1 cursor-pointer group"
                            onClick={() => setTermsAccepted(!termsAccepted)}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-flyer-red border-flyer-red' : 'border-slate-300 bg-white group-hover:border-flyer-red/50'}`}>
                                {termsAccepted && <ShieldCheck className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                I agree to the{" "}
                                <Link href="/terms" target="_blank" className="text-flyer-red hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                                    Terms of Service
                                </Link>
                                {" "}and{" "}
                                <Link href="/privacy" target="_blank" className="text-flyer-red hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                                    Privacy Policy
                                </Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !termsAccepted}
                            className="group relative w-full h-18 bg-slate-900 text-white font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                            <span className="bg-white px-4 text-slate-300">Fast Access</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={!termsAccepted}
                            className="w-full h-16 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 group font-black uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Login
                        </button>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/register" className="text-xs font-black text-slate-400 hover:text-flyer-red transition-all uppercase tracking-[0.2em] group">
                        New here? <span className="text-flyer-red group-hover:underline">Create Account</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
