import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flyer-red/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-flyer-green/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-2xl px-8 text-center space-y-8">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl transform -rotate-6">
                    <span className="text-4xl">🚧</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 italic tracking-tighter leading-none">
                    COMING <span className="text-flyer-red">SOON</span>
                </h1>

                <p className="text-xl text-slate-500 font-medium">
                    This feature is currently under construction by our digital architects.
                    Check back later for something amazing.
                </p>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-slate-900/20"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
