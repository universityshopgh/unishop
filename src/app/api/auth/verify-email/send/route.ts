import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendHubEmail } from '@/lib/notificationHub';

export async function POST(request: Request) {
    try {
        const { email, uid, name } = await request.json();

        if (!email || !uid) {
            return NextResponse.json({ error: "Email and User ID required" }, { status: 400 });
        }

        // Generate simple token (in production use a more secure method or Firebase's built-in link generation)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Store token
        await adminDb.collection('verification_tokens').doc(token).set({
            uid,
            email,
            expiresAt: expires,
            createdAt: Date.now()
        });

        // Verification Link
        const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        // Send Email via SMTP
        const emailResult = await sendHubEmail(
            email,
            'Verify your UniShop Email',
            `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: center;">
                    <h1 style="color: #0f172a; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; font-weight: 900; font-size: 32px; margin-bottom: 8px;">UniShop <span style="color: #ef4444;">Auth</span></h1>
                    <p style="color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 32px;">Email Verification Protocol</p>
                    
                    <p style="color: #0f172a; font-size: 16px; font-weight: 600;">Hi ${name || 'Citizen'},</p>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 32px;">Please verify your email address to secure your account and gain full access to the Hub.</p>
                    
                    <a href="${link}" style="display: inline-block; background: #0f172a; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Verify Email Address</a>
                    
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">This verification link expires in 24 hours.</p>
                </div>
            `
        );

        if (!emailResult) {
            console.error("Failed to send verification email via SMTP");
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Verification Email Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
