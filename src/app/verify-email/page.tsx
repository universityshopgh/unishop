"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    // Status states
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/auth/verify-email/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully!');
                    // Redirect to login after 3 seconds
                    setTimeout(() => router.push('/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            }
        };

        verify();
    }, [token, router]);

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-50 text-center max-w-md w-full relative overflow-hidden"
        >
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-colors ${status === 'verifying' ? 'bg-slate-100 text-slate-400' :
                    status === 'success' ? 'bg-flyer-green/10 text-flyer-green' :
                        'bg-flyer-red/10 text-flyer-red'
                }`}>
                {status === 'verifying' ? <Loader2 className="w-10 h-10 animate-spin" /> :
                    status === 'success' ? <CheckCircle2 className="w-10 h-10" /> :
                        <XCircle className="w-10 h-10" />}
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">
                {status === 'verifying' ? 'Verifying...' :
                    status === 'success' ? 'Verified!' :
                        'Verification Failed'}
            </h1>

            <p className="text-slate-500 font-bold mb-8">
                {message}
            </p>

            {status === 'error' && (
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest hover:text-flyer-red transition-colors"
                >
                    Back to Login
                    <ArrowRight className="w-4 h-4" />
                </Link>
            )}

            {status === 'success' && (
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-6">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="h-full bg-flyer-green"
                    />
                </div>
            )}
        </motion.div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-flyer-light">
            <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-slate-300" />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
