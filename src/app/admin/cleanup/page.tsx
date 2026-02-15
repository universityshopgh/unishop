"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, CheckCircle, ArrowLeft } from "lucide-react";

export default function CleanupPage() {
    const [status, setStatus] = useState("idle"); // idle, processing, success, error
    const [count, setCount] = useState(0);
    const router = useRouter();

    const handleCleanup = async () => {
        if (!confirm("Are you sure you want to delete ALL orders? This cannot be undone.")) return;

        setStatus("processing");
        try {
            const batch = writeBatch(db);
            const ordersSnap = await getDocs(collection(db, "orders"));

            setCount(ordersSnap.size);

            if (ordersSnap.empty) {
                setStatus("success");
                return;
            }

            ordersSnap.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            setStatus("success");
        } catch (error) {
            console.error("Cleanup failed:", error);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center space-y-8">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-10 h-10" />
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic">Database Cleanup</h1>
                    <p className="text-sm text-slate-500 font-bold mt-2">Permanently delete all order records</p>
                </div>

                {status === "idle" && (
                    <button
                        onClick={handleCleanup}
                        className="w-full py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                        Purge All Orders
                    </button>
                )}

                {status === "processing" && (
                    <div className="flex flex-col items-center gap-4 text-slate-400 font-bold animate-pulse">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                        <p>Deleting records...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Success: {count} Orders Deleted
                        </div>
                        <button
                            onClick={() => router.push("/admin")}
                            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Admin
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">
                        Error occurred. Check console.
                    </div>
                )}
            </div>
        </div>
    );
}
