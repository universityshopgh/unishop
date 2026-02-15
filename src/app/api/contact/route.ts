import { NextResponse } from 'next/server';
import { sendHubEmail } from '@/lib/notificationHub';
import siteConfig from '@/config/site-config.json';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, acquisitionId, message } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Admin Email from Site Config or Env
        const adminEmail = siteConfig.brand.email || process.env.ADMIN_EMAIL || 'universityshop845@gmail.com';

        // Send Email via Hub
        const emailResult = await sendHubEmail(
            adminEmail,
            `New Contact Inquiry: ${name || 'User'}`,
            `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>New Message from ${siteConfig.brand.name} Contact Form</h1>
                    <p><strong>Name:</strong> ${name || 'N/A'}</p>
                    <p><strong>Acquisition ID:</strong> ${acquisitionId || 'N/A'}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; background: #f4f4f4; padding: 15px; border-radius: 8px;">${message}</p>
                </div>
            `
        );

        if (!emailResult) {
            console.error("Failed to forward contact email");
            return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
