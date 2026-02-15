"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

export default function GetAdminUIDPage() {
    const { user, profile, isAdmin } = useAuth();
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/");
        }
    }, [isAdmin, router]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-flyer-red"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-flyer-light pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-[40px] p-10 shadow-xl">
                    <h1 className="text-3xl font-black text-slate-900 uppercase mb-2">
                        Admin <span className="text-flyer-red">UID</span>
                    </h1>
                    <p className="text-slate-400 text-sm mb-8">
                        Copy this UID to your .env.local file
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
                                Your UID
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={user.uid}
                                    readOnly
                                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-mono text-sm text-slate-900"
                                />
                                <button
                                    onClick={() => copyToClipboard(user.uid)}
                                    className="px-6 py-4 bg-flyer-red text-white rounded-2xl hover:bg-flyer-red/90 transition-all flex items-center gap-2 font-bold"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
                                Email
                            </label>
                            <input
                                type="text"
                                value={profile.email || ""}
                                readOnly
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-900"
                            />
                        </div>

                        <div className="bg-flyer-red/5 border border-flyer-red/10 rounded-2xl p-6">
                            <h3 className="font-black text-sm uppercase tracking-wider text-flyer-red mb-3">
                                Instructions
                            </h3>
                            <ol className="space-y-2 text-sm text-slate-600">
                                <li className="flex gap-2">
                                    <span className="font-black text-flyer-red">1.</span>
                                    <span>Copy the UID above</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-black text-flyer-red">2.</span>
                                    <span>
                                        Open <code className="bg-slate-100 px-2 py-1 rounded">.env.local</code> file
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-black text-flyer-red">3.</span>
                                    <span>
                                        Replace <code className="bg-slate-100 px-2 py-1 rounded">REPLACE_WITH_ACTUAL_UID</code> with your UID
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-black text-flyer-red">4.</span>
                                    <span>Restart the development server</span>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 font-mono text-xs">
                            <div className="text-slate-400 mb-2">.env.local</div>
                            <code className="text-slate-900">
                                NEXT_PUBLIC_AUTHORIZED_ADMIN_UID={user.uid}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
