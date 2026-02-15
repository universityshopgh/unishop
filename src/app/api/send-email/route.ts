import { NextResponse } from 'next/server';
import { notifyHub } from '@/lib/notificationHub';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, orderId, items, total, customerName, phone } = body;

        if (!email || !orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use Centralized Multi-Channel Hub
        await notifyHub({
            action: 'order_customer',
            name: customerName,
            email: email,
            phone: phone,
            order_id: orderId,
            total: total
        });

        await notifyHub({
            action: 'order_admin',
            name: customerName,
            order_id: orderId,
            total: total
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
