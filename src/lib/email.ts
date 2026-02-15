import { Resend } from 'resend';


// Provide a placeholder for the build phase to prevent crashes.
// Actual key must be set in Vercel Environment Variables.
const apiKey = process.env.RESEND_API_KEY || 're_build_placeholder_123';
export const resend = new Resend(apiKey);

export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  items: any[],
  total: number
) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing");
    return { success: false, error: "Configuration Error" };
  }

  try {
    const data = await resend.emails.send({
      from: 'UniShop <onboarding@resend.dev>', // Default Resend test email
      to: email,
      subject: `Order Confirmation #${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Thank you for your order!</h1>
          <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Summary</h3>
            <ul style="list-style: none; padding: 0;">
              ${items.map(item => `
                <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>₵${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              `).join('')}
            </ul>
            <div style="margin-top: 10px; font-weight: bold; text-align: right;">
              Total: ₵${total.toFixed(2)}
            </div>
          </div>

          <p>We will notify you when your items are ready for pickup at the Hub.</p>
        </div>
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

export const sendAdminOrderAlert = async (
  adminEmail: string,
  orderId: string,
  amount: number,
  customerName: string
) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: 'UniShop Alerts <onboarding@resend.dev>',
      to: adminEmail,
      subject: `New Order Received: ₵${amount.toFixed(2)}`,
      html: `
                <h1>New Order Alert!</h1>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Amount:</strong> ₵${amount.toFixed(2)}</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin">View Dashboard</a>
            `
    });
  } catch (error) {
    console.error("Admin alert failed:", error);
  }
}
