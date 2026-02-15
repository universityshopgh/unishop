import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { sendHubEmail } from '@/lib/notificationHub';
import siteConfig from '@/config/site-config.json';
import { resetPasswordTemplate } from '@/lib/emailTemplates';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Generate Password Reset Link using Firebase Admin SDK
        const link = await adminAuth.generatePasswordResetLink(email);

        // 2. Send Email via SMTP
        const emailResult = await sendHubEmail(
            email,
            'Reset your UniShop Password',
            resetPasswordTemplate(link)
        );

        if (!emailResult) {
            throw new Error("Failed to send reset link via SMTP");
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Password Reset Error:", error);

        // Handle case where user not found
        if (error.code === 'auth/user-not-found') {
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }

        return NextResponse.json({ error: error.message || "Failed to send reset link" }, { status: 500 });
    }
}
