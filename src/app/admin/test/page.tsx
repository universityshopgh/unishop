"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function FirebaseTestPage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setStatus("Testing Firebase connection...\n");

        try {
            // Test 1: Write a test document
            setStatus(prev => prev + "✓ Attempting to write test document...\n");
            const testRef = await addDoc(collection(db, "test"), {
                message: "Hello from UniShop!",
                timestamp: new Date(),
            });
            setStatus(prev => prev + `✓ Write successful! Doc ID: ${testRef.id}\n`);

            // Test 2: Read the document back
            setStatus(prev => prev + "✓ Attempting to read documents...\n");
            const snapshot = await getDocs(collection(db, "test"));
            setStatus(prev => prev + `✓ Read successful! Found ${snapshot.size} documents\n`);

            setStatus(prev => prev + "\n✅ Firebase is working correctly!\n");
            setStatus(prev => prev + "You can now initialize the database.\n");

        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            setStatus(prev => prev + `\n❌ Error: ${err.message}\n`);
            setStatus(prev => prev + `Code: ${err.code}\n`);

            if (err.code === "permission-denied") {
                setStatus(prev => prev + "\n🔧 Fix: Update Firestore security rules to allow writes.\n");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                    <h1 className="text-3xl font-black text-slate-900 mb-6">
                        Firebase Connection Test
                    </h1>

                    <button
                        onClick={testConnection}
                        disabled={loading}
                        className="w-full bg-[#c41e3a] hover:bg-[#a01830] text-white py-4 rounded-2xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 mb-6"
                    >
                        {loading ? "Testing..." : "Test Firebase Connection"}
                    </button>

                    {status && (
                        <div className="bg-slate-900 text-green-400 p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap">
                            {status}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-900 font-medium">
                            <strong>What this does:</strong> Tests if your app can write to and read from Firestore.
                        </p>
                    </div>

                    <div className="mt-4 space-y-2">
                        <a
                            href="/admin/seed"
                            className="block text-center text-[#c41e3a] font-bold hover:underline"
                        >
                            → Go to Database Initialization
                        </a>
                        <a
                            href="https://console.firebase.google.com/project/unishop-15bb5/firestore/databases/-default-/rules"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-slate-600 font-medium hover:underline text-sm"
                        >
                            → Open Firestore Rules in Firebase Console
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
