import React, { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { Loader2, ShieldCheck, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { formatGhanaPhoneNumber } from "@/lib/phoneUtils";

export interface PaystackReference {
    message: string;
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    trxref: string;
}

interface PaystackPaymentProps {
    email: string;
    amount: number;
    metadata?: any;
    onSuccess: (reference: PaystackReference) => void;
    onClose: () => void;
    disabled?: boolean;
}

const PaystackPaymentInner = ({ email, amount, metadata, onSuccess, onClose, disabled }: PaystackPaymentProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Names for Paystack
    const names = (metadata?.name || "Customer").split(" ");
    const firstname = names[0];
    const lastname = names.length > 1 ? names.slice(1).join(" ") : "User";

    // Standard 10-digit local format (054...) is often the most reliable for Ghana MoMo USSD trigger
    const localPhone = formatGhanaPhoneNumber(metadata?.phone || "").replace(/^\+233/, "0").replace(/\D/g, "");

    const config: any = {
        reference: `ORD-${new Date().getTime()}`,
        email: email,
        amount: Math.round(amount * 100), // Pesewas
        currency: "GHS",
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        firstname,
        lastname,
        phone: localPhone,
        metadata: {
            ...metadata,
            phone: localPhone,
            phone_number: localPhone,
            custom_fields: [
                ...(metadata?.custom_fields || []),
                {
                    display_name: "Customer Phone",
                    variable_name: "customer_phone",
                    value: localPhone
                }
            ]
        },
        label: "UniShop Ghana",
        channels: ['mobile_money', 'card']
    };

    const initializePayment = usePaystackPayment(config);

    const handlePaymentClick = () => {
        setIsProcessing(true);
        // Standard react-paystack call usually expects positional arguments: (onSuccess, onClose)
        initializePayment({
            onSuccess: (reference: any) => {
                setIsProcessing(false);
                onSuccess(reference);
            },
            onClose: () => {
                setIsProcessing(false);
                onClose();
            }
        });
    };

    if (disabled) {
        return (
            <button
                disabled
                className="w-full h-24 rounded-[3rem] bg-slate-100 text-slate-300 font-black uppercase tracking-[0.2em] flex items-center justify-center cursor-not-allowed border-4 border-white shadow-inner"
            >
                <Lock className="w-5 h-5 mr-3 opacity-30" />
                Awaiting Delivery Info
            </button>
        );
    }

    return (
        <div className="relative group/payment p-2 bg-gradient-to-b from-white to-slate-50 rounded-[4rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-flyer-red/5 via-transparent to-flyer-green/5 rounded-[4rem] opacity-0 group-hover/payment:opacity-100 transition-opacity duration-1000" />

            <div className="relative z-10 space-y-4">
                <button
                    onClick={handlePaymentClick}
                    disabled={isProcessing}
                    className="w-full relative h-24 rounded-[3.5rem] p-1 overflow-hidden transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] shadow-2xl shadow-slate-900/10 group/btn"
                >
                    {/* Multi-layered Gradient Background */}
                    <div className="absolute inset-0 bg-slate-900 group-hover/btn:bg-black transition-colors duration-500" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2)_0%,transparent_70%)] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />

                    <div className="relative h-full w-full rounded-[3.2rem] border border-white/10 flex items-center justify-center gap-6">
                        {isProcessing ? (
                            <div className="flex items-center gap-4">
                                <Loader2 className="w-6 h-6 text-flyer-red animate-spin" />
                                <span className="text-white font-black uppercase tracking-[0.2em] italic">
                                    Processing...
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-slate-900 transition-all duration-500">
                                    <CreditCard className="w-6 h-6 transition-transform duration-500 group-hover/btn:rotate-12" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-white font-black uppercase tracking-[0.2em] text-xs leading-none">
                                        Pay Now
                                    </span>
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">
                                        Payment secured by Paystack
                                    </span>
                                </div>
                                <div className="ml-2 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:border-flyer-red transition-colors duration-500">
                                    <div className="w-2 h-2 bg-flyer-red rounded-full animate-pulse" />
                                </div>
                            </>
                        )}
                    </div>
                </button>

                <div className="px-8 py-5 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-100 flex items-center justify-between group/status transition-colors hover:border-flyer-green/20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-flyer-green/10 rounded-xl flex items-center justify-center text-flyer-green">
                            <ShieldCheck className="w-5 h-5 group-hover/status:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider italic">Secure Payment</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Merchant: UniShop</p>
                        </div>
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center`}>
                                <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-flyer-red' : 'bg-yellow-400'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Manual Approval Instruction (Helpful for Ghana MoMo) */}
                <div className="px-8 py-6 bg-slate-100/50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed">
                        <span className="text-flyer-red italic underline">MoMo Tip:</span> If no automated prompt appears, please check your network's approvals menu (e.g., <span className="text-slate-900">*170#</span> {">"} 6 {">"} 3 for MTN).
                    </p>
                </div>
            </div>


        </div>
    );
};

export default PaystackPaymentInner;

