import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { reference, expectedAmount } = await request.json();

        if (!reference) {
            return NextResponse.json({ error: "Reference is required" }, { status: 400 });
        }

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

        if (!PAYSTACK_SECRET_KEY) {
            console.error("PAYSTACK_SECRET_KEY is not defined in environment variables");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const data = await response.json();

        if (data.status && data.data.status === "success") {
            // CRITICAL SECURITY CHECK: Verify the amount matches expected
            // Paystack returns amount in subunits (pesewas/kobo)
            const paidAmount = data.data.amount / 100;

            if (expectedAmount && Math.abs(paidAmount - expectedAmount) > 0.01) {
                return NextResponse.json({
                    success: false,
                    message: `Security Alert: Amount mismatch. Paid GHS${paidAmount} but expected GHS${expectedAmount}.`
                }, { status: 400 });
            }

            return NextResponse.json({ success: true, data: data.data });
        } else {
            return NextResponse.json({ success: false, message: data.message || "Verification failed" }, { status: 400 });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
