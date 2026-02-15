import { NextResponse } from 'next/server';
import { notifyHub } from '@/lib/notificationHub';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            orderId,
            items,
            total,
            customerName,
            email,
            phone,
            couponCode,
            couponOwner
        } = body;

        if (!orderId || !total) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`[Notifications] Hub Pulse: Processing Order ${orderId}`);

        // --- 1. Customer Confirmation (Email, SMS, WhatsApp) ---
        await notifyHub({
            action: 'order_customer',
            name: customerName,
            email: email,
            phone: phone,
            order_id: orderId,
            total: total
        });

        // --- 2. Admin Alert (Email, SMS, WhatsApp) ---
        await notifyHub({
            action: 'order_admin',
            name: customerName,
            order_id: orderId,
            total: total
        });

        // --- 3. Ambassador/Referral Notifications ---
        if (couponCode && couponOwner) {
            await notifyHub({
                action: 'referral_alert',
                owner_phone: couponOwner.phoneNumber,
                owner_email: couponOwner.email,
                coupon: couponCode,
                name: couponOwner.displayName,
                total: total
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[Notifications Hub Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
