import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 });
        }

        const tokenRef = adminDb.collection('verification_tokens').doc(token);
        const tokenDoc = await tokenRef.get();

        if (!tokenDoc.exists) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const data = tokenDoc.data();
        if (data?.expiresAt < Date.now()) {
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        // Token valid -> Verify User
        await adminDb.collection('users').doc(data?.uid).update({
            emailVerified: true,
            emailVerifiedAt: Date.now()
        });

        // Delete used token
        await tokenRef.delete();

        return NextResponse.json({ success: true, email: data?.email });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
