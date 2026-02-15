
import { NextResponse } from "next/server";
import { notifyHub } from "@/lib/notificationHub";

export async function GET() {
    try {
        console.log("🛠️ TEST: Triggering Notification Protocols...");

        const testTarget = {
            email: "universityshop845@gmail.com",
            phone: "233599764428",
            name: "Hub Architect"
        };

        // 1. Welcome
        await notifyHub({
            action: 'welcome',
            ...testTarget
        });

        // 2. OTP
        await notifyHub({
            action: 'otp',
            code: "HUB-99",
            channel: 'email',
            ...testTarget
        });

        // 3. Order Alert
        await notifyHub({
            action: 'order_admin',
            order_id: "TEST-PRO-01",
            total: "1,200.00",
            ...testTarget
        });

        return NextResponse.json({
            success: true,
            message: "Notification protocols executed. Check server console for delivery logs.",
            config: {
                smtp_user: process.env.SMTP_USER || "NOT_SET",
                has_pass: !!process.env.SMTP_PASSWORD,
                infobip_key: !!process.env.INFOBIP_API_KEY
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
