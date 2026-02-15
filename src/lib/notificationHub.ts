import { sendSMS, sendWhatsApp } from '@/lib/sms';
import { sendFormspreeEmail } from './formspree';
import {
    otpTemplate,
    welcomeTemplate,
    orderAdminTemplate,
    orderCustomerTemplate,
    referralAlertTemplate
} from './emailTemplates';
import { resend } from './email';

const ADMIN_EMAIL = "universityshop845@gmail.com";

export const sendHubEmail = async (to: string, subject: string, html: string) => {
    // 1. If destination is the Admin, use Formspree for monitoring/logging
    if (to.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log(`[EmailHub] Routing Admin Alert to Formspree: ${subject}`);
        try {
            const result = await sendFormspreeEmail(to, subject, html);
            return result.success;
        } catch (err: any) {
            console.error('❌ [EmailHub] Formspree error:', err.message);
            return false;
        }
    }

    // 2. If destination is a User, use Resend for direct delivery
    console.log(`[EmailHub] Routing User Transactional to Resend: ${to} | Subject: ${subject}`);
    try {
        const { error } = await resend.emails.send({
            from: 'UniShop <onboarding@resend.dev>',
            to,
            subject,
            html,
        });
        if (!error) {
            console.log(`✅ [EmailHub] Resend success for ${to}`);
            return true;
        }
        console.error(`❌ [EmailHub] Resend failed for ${to}:`, error);
    } catch (err: any) {
        console.error('❌ [EmailHub] Resend execution error:', err.message);
    }

    return false;
};

export const notifyHub = async (params: {
    action: 'welcome' | 'otp' | 'referral_alert' | 'order_admin' | 'order_customer',
    email?: string,
    phone?: string,
    name?: string,
    code?: string,
    coupon?: string,
    owner_phone?: string,
    owner_email?: string,
    order_id?: string,
    total?: string | number,
    channel?: 'sms' | 'whatsapp' | 'email',
    items?: any[]
}) => {
    const { action, email, phone, name, code, coupon, owner_phone, owner_email, order_id, total, channel } = params;

    switch (action) {
        case 'welcome':
            // 1. Notify User (Welcome)
            if (email) await sendHubEmail(email, "Welcome to UniShop Hub", welcomeTemplate(name || "Citizen"));
            if (phone) await sendWhatsApp(phone, `Welcome to UniShop, ${name}! Your account is active.`);

            // 2. Notify Admin (Plain Text - No HTML)
            const adminEmail = process.env.ADMIN_EMAIL || "universityshop845@gmail.com";
            const adminNotice = `
NEW HUB RECRUIT SECURED
Citizen Name: ${name || "Unknown"}
Identity Email: ${email || "None"}
Registry Phone: ${phone || "None"}

System Protocol: UniShop Admin Monitoring Active.
            `.trim();
            await sendHubEmail(adminEmail, `Admin Alert: New Signup - ${name}`, adminNotice);
            break;

        case 'otp':
            const otpMsg = `Your UniShop verification code is ${code}. Do not share.`;
            if (channel === 'email' && email) {
                // A. Send Code to User (via Resend)
                await sendHubEmail(email, "Verification Access Protocol: UniShop", otpTemplate(code || "000000"));

                // B. Notify Admin (Plain Text Monitor - No Code)
                const otpAdminNotice = `
SECURITY ALERT: Handshake Initiated
Identity: ${email}
Action: OTP Requested for Verification
Status: Protocol active, code transmitted to user.

Admin monitoring enabled.
                `.trim();
                await sendHubEmail(ADMIN_EMAIL, `Security Alert: OTP Generation - ${email}`, otpAdminNotice);
            } else if (phone) {
                if (channel === 'whatsapp') await sendWhatsApp(phone, otpMsg);
                else await sendSMS(phone, otpMsg);
            }
            break;

        case 'referral_alert':
            const alertMsg = `UniShop: Your referral code ${coupon} was just used! Check your profile for earnings.`;
            const earnings = total ? (Number(total) * 0.05).toFixed(2) : "0.00";

            if (owner_phone) await sendSMS(owner_phone, alertMsg);
            if (owner_email && coupon) {
                await sendHubEmail(
                    owner_email,
                    "Commission Secured: New Referral",
                    referralAlertTemplate(name || "Ambassador", coupon, earnings)
                );
            }
            break;

        case 'order_customer':
            const idVal = order_id || "TRANS-HUB";
            const totVal = total?.toString() || "0.00";
            const cMsg = `Hi ${name}, Order #${idVal.slice(0, 8).toUpperCase()} confirmed! Total: ₵${totVal}.`;
            if (email) await sendHubEmail(email, "Order Confirmation", orderCustomerTemplate(name || "Citizen", idVal, totVal));
            if (phone) await sendSMS(phone, cMsg);
            break;

        case 'order_admin':
            const admEmail = process.env.ADMIN_EMAIL || "universityshop845@gmail.com";
            const admPhone = process.env.ADMIN_PHONE;
            const aMsg = `URGENT: New order! ID: ${order_id}. Total: ₵${total} from ${name}.`;
            if (admEmail) await sendHubEmail(admEmail, "CRITICAL: New Order", orderAdminTemplate(order_id || "HUB", total?.toString() || "0.00", name || "Citizen"));
            if (admPhone) await sendSMS(admPhone, aMsg);
            break;
    }
};
