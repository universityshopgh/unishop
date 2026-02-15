"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PaystackPaymentInner = dynamic(
    () => import("./PaystackPaymentInner"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-24 rounded-[3.5rem] bg-white border border-slate-100 flex items-center justify-center gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50/0 via-slate-50/50 to-slate-50/0 animate-shimmer" />
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center relative">
                    <Loader2 className="w-6 h-6 text-slate-200 animate-spin" />
                </div>
                <div className="space-y-1 relative">
                    <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-2 w-20 bg-slate-50 rounded-full animate-pulse" />
                </div>
            </div>
        )
    }
);

// Re-export the interface for type safety in other components
export type { PaystackReference } from "./PaystackPaymentInner";

export default PaystackPaymentInner;
