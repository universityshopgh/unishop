"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/services/userService";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowRight, CheckCircle, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatGhanaPhoneNumber, isValidGhanaPhoneNumber } from "@/lib/phoneUtils";
import Modal from "@/components/ui/Modal";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [applyForAmbassador, setApplyForAmbassador] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [error, setError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Verification State
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const router = useRouter();
    const { refreshProfile } = useAuth();

    // Live username check
    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 3) {
                setUsernameError("");
                return;
            }
            setIsCheckingUsername(true);
            try {
                const available = await userService.isUsernameAvailable(username);
                if (!available) {
                    setUsernameError("Username is taken");
                } else {
                    setUsernameError("");
                }
            } catch (err) {
                console.error("Error checking username:", err);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [username]);

    const validateUsername = (val: string) => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!val) return "Username is required";
        if (val.length < 3) return "Too short (min 3 chars)";
        if (val.length > 20) return "Too long (max 20 chars)";
        if (!regex.test(val)) return "Letters, numbers and underscores only";
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!termsAccepted) {
            setError("You must agree to the Terms of Service and Privacy Policy");
            return;
        }

        const uError = validateUsername(username);
        if (uError) {
            setUsernameError(uError);
            return;
        }

        setLoading(true);

        try {
            // 1. Check uniqueness and existing accounts
            const available = await userService.isUsernameAvailable(username);
            if (!available) {
                setError("Username is already taken. Please choose another.");
                return;
            }

            const emailExists = await userService.isEmailRegistered(email);
            if (emailExists) {
                setError("Email is already registered. Please login.");
                return;
            }

            if (phone) {
                const formattedPhone = formatGhanaPhoneNumber(phone);
                if (!isValidGhanaPhoneNumber(formattedPhone)) {
                    setError("Invalid Ghana phone number format.");
                    return;
                }
            }

            // 2. Create Firebase Auth account
            let user;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
            } catch (authErr: any) {
                if (authErr.code === 'auth/email-already-in-use') {
                    // Reconciliation Logic for Ghost Users
                    try {
                        const signInCredential = await signInWithEmailAndPassword(auth, email, password);
                        user = signInCredential.user;

                        // Check if profile actually exists
                        const existingProfile = await userService.getUserProfile(user.uid);
                        if (existingProfile) {
                            setError("This email is already fully registered. Please login.");
                            return;
                        }
                        console.log("Ghost user detected. Reconciling profile...");
                    } catch (signInErr: any) {
                        setError("Email is already in use. Please login or reset your password.");
                        return;
                    }
                } else {
                    throw authErr;
                }
            }

            if (user) {
                // 3. Send Firebase Email Verification (Link-based)
                await sendEmailVerification(user);

                // 4. Update Profile & Save to Firestore
                await updateProfile(user, { displayName: name });
                await userService.createUserAccount({
                    uid: user.uid,
                    username: username.toLowerCase(),
                    displayName: name,
                    email: email.toLowerCase(),
                    phoneNumber: phone ? formatGhanaPhoneNumber(phone) : null,
                    phoneVerified: false,
                    role: "customer",
                    createdAt: new Date(),
                    photoURL: null,
                });

                // 5. Notify Hub (Welcome + Admin Alert)
                await fetch('/api/auth/otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'welcome',
                        email: email.toLowerCase(),
                        phone: phone,
                        name: name
                    })
                });

                // Success State
                setVerificationSent(true);
            }

        } catch (err: any) {
            console.error("Registration Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Email is already in use. Please login or reset your password.");
            } else {
                setError(err.message || "Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!auth.currentUser) {
            setError("No user session found. Please try logging in.");
            return;
        }
        setResendLoading(true);
        try {
            await sendEmailVerification(auth.currentUser);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message || "Failed to resend link.");
        } finally {
            setResendLoading(false);
        }
    };





    return (
        <div className="min-h-screen flex items-center justify-center p-6 mesh-gradient bg-white">
            {/* Background Accents */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flyer-red rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flyer-green rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10 px-4 sm:px-0 mt-8 mb-8"
            >
                <div className="text-center mb-6 sm:mb-10 space-y-3 sm:space-y-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-flyer-red text-white font-black rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-flyer-red/20 text-xl sm:text-2xl">
                        U
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase">
                        {verificationSent ? "Check Email" : "Join UniShop"}
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                        {verificationSent ? `Verification link dispatched` : "Your student hub account awaits"}
                    </p>
                </div>

                <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    {error && (
                        <div className="bg-flyer-red/5 border border-flyer-red/10 text-flyer-red text-[10px] sm:text-xs p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 font-bold text-center">
                            {error}
                        </div>
                    )}

                    {!verificationSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-flyer-red px-2">Personal Info</label>

                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] sm:rounded-3xl py-4 sm:py-5 flex pl-14 sm:pl-16 pr-6 sm:pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                        className={`w-full bg-slate-50 border-2 ${usernameError ? 'border-flyer-red/50' : 'border-transparent'} rounded-[1.5rem] sm:rounded-3xl py-4 sm:py-5 flex pl-14 sm:pl-16 pr-6 sm:pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300`}
                                        placeholder="Username"
                                    />
                                    {isCheckingUsername && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                                        </div>
                                    )}
                                    {usernameError && !isCheckingUsername && <p className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-flyer-red font-bold uppercase">{usernameError}</p>}
                                </div>

                                <div className="relative group">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] sm:rounded-3xl py-4 sm:py-5 flex pl-14 sm:pl-16 pr-6 sm:pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="Phone (optional)"
                                    />
                                </div>
                            </div>



                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-flyer-red px-2">Security</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] sm:rounded-3xl py-4 sm:py-5 flex pl-14 sm:pl-16 pr-6 sm:pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="name@example.com"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-flyer-red transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] sm:rounded-3xl py-4 sm:py-5 flex pl-14 sm:pl-16 pr-6 sm:pr-8 text-sm focus:outline-none focus:bg-white focus:border-flyer-red/20 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setApplyForAmbassador(!applyForAmbassador)}>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${applyForAmbassador ? 'bg-flyer-red border-flyer-red' : 'border-slate-300 bg-white'}`}>
                                    {applyForAmbassador && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        Apply as Ambassador
                                        <span className="bg-flyer-red text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-tighter">New</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                                        Join the elite team. Get a unique coupon code, earn commissions, and access exclusive events.
                                    </p>
                                </div>
                            </div>

                            {/* Terms and Privacy Checkbox */}
                            <div
                                className="flex items-start gap-4 p-2 cursor-pointer group"
                                onClick={() => setTermsAccepted(!termsAccepted)}
                            >
                                <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-flyer-red border-flyer-red' : 'border-slate-300 bg-white group-hover:border-flyer-red/50'}`}>
                                    {termsAccepted && <ShieldCheck className="w-3 h-3 text-white" />}
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                    I agree to the{" "}
                                    <Link href="/terms" target="_blank" className="text-flyer-red hover:underline underline-offset-4" onClick={(e) => e.stopPropagation()}>
                                        Terms of Service
                                    </Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" target="_blank" className="text-flyer-red hover:underline underline-offset-4" onClick={(e) => e.stopPropagation()}>
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !!usernameError}
                                className="group relative w-full h-14 sm:h-18 bg-slate-900 text-white font-black rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[11px] font-bold text-slate-400">
                                Already have an account?{" "}
                                <Link href="/login" className="text-flyer-red hover:underline decoration-2 underline-offset-4">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 sm:space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <Mail className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Check Your Inbox</h2>
                            <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed px-4">
                                A verification link has been dispatched to <br className="hidden sm:block" />
                                <span className="text-slate-900 font-black">{email}</span>. <br /><br />
                                Please authorize your account via the link to complete the handshake.
                            </p>
                            <div className="space-y-3 pt-2">
                                <Link
                                    href="/login"
                                    className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                                >
                                    Return to Login
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <button
                                    onClick={handleResendEmail}
                                    disabled={resendLoading}
                                    className="w-full h-14 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                                >
                                    {resendLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : resendSuccess ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            Link Sent!
                                        </>
                                    ) : (
                                        "Resend Verification Link"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>




        </div>
    );
}
