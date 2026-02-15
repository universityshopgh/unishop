import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Dummy order data
        const orderId = `TEST-${Date.now()}`;
        const items = [
            { name: "Test Item 1", quantity: 1, price: 50 },
            { name: "Test Item 2", quantity: 2, price: 25 }
        ];
        const total = 100;

        const result = await sendOrderConfirmationEmail(email, orderId, items, total);

        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
