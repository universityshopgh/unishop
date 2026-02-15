"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AuthDebugPage() {
    const [status, setStatus] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (message: string) => {
        setStatus(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    };

    const forceCreateAdmin = async () => {
        setLoading(true);
        setStatus([]);
        addLog("🚀 Starting Admin Creation Debugger...");

        const email = "universityshop845@gmail.com";
        const password = "admin1";

        try {
            // 1. Try to create the user
            addLog(`Attempting to create user: ${email}`);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                addLog(`✅ User created successfully! UID: ${user.uid}`);

                // 2. Create Firestore profile
                addLog("Creating Firestore profile...");
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: email,
                    displayName: "Kingsford",
                    role: "admin",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                addLog("✅ Firestore profile created.");

            } catch (createError: unknown) {
                const cErr = createError as { code?: string; message: string };
                if (cErr.code === "auth/email-already-in-use") {
                    addLog("⚠️ User already exists.");
                    addLog("🔄 Attempting to sign in with 'admin' (old password)...");
                    try {
                        await signInWithEmailAndPassword(auth, email, "admin");
                        addLog("✅ Login successful with OLD password 'admin'!");
                        addLog("⚠️ NOTE: Your password is 'admin', not 'admin1'.");
                    } catch (loginError: unknown) {
                        const lErr = loginError as Error;
                        addLog(`❌ Login failed with 'admin'. Password is unknown. Error: ${lErr.message}`);
                        addLog("🛑 ACTION REQUIRED: You must delete this user manually.");
                        addLog("1. Go to Firebase Console -> Authentication");
                        addLog("2. Delete user 'universityshop845@gmail.com'");
                        addLog("3. Come back here and click 'Force Create' again.");
                        return; // Stop here
                    }
                } else if (cErr.code === "auth/operation-not-allowed") {
                    addLog("❌ CRITICAL ERROR: Email/Password provider is disabled!");
                    addLog("👉 Fix: Go to Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password");
                    throw createError;
                } else {
                    throw createError;
                }
            }

            // 3. Verify Login works
            addLog("Testing login with credentials...");
            await signOut(auth); // Sign out first
            await signInWithEmailAndPassword(auth, email, password);
            addLog("✅ Login successful! Credentials are valid.");
            addLog("🎉 YOU ARE READY! Go to /login now.");

        } catch (error: unknown) {
            const err = error as { message: string; code?: string };
            addLog(`❌ ERROR: ${err.message}`);
            addLog(`❌ CODE: ${err.code}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
                <h1 className="text-2xl font-black text-slate-800 mb-6">Auth Debugger</h1>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <p className="font-bold text-blue-900 mb-2">Target Credentials:</p>
                    <p className="font-mono text-sm text-blue-800">Email: universityshop845@gmail.com</p>
                    <p className="font-mono text-sm text-blue-800">Password: admin1</p>
                </div>

                <button
                    onClick={forceCreateAdmin}
                    disabled={loading}
                    className="w-full bg-flyer-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 mb-6"
                >
                    {loading ? "Running Diagnostics..." : "Force Create & Test Admin Account"}
                </button>

                <div className="bg-slate-900 text-green-400 p-6 rounded-xl font-mono text-sm min-h-[200px] overflow-auto">
                    {status.length === 0 ? "Logs will appear here..." : status.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
