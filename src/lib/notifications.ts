import { notifyHub } from "./notificationHub";
import { Order, UserProfile, Coupon } from "@/types";

export const sendCouponUsageAlerts = async (
    params: {
        orderId: string;
        amount: number;
        customerName: string;
        couponOwner: {
            email: string;
            phoneNumber: string;
            displayName: string;
        };
        couponCode: string;
    }
) => {
    const { orderId, amount, customerName, couponOwner, couponCode } = params;

    // Notify Coupon Owner and Admin via Central Hub
    await notifyHub({
        action: 'referral_alert',
        owner_phone: couponOwner.phoneNumber,
        owner_email: couponOwner.email,
        coupon: couponCode,
        name: couponOwner.displayName
    });

    console.log(`✅ Referral alert sent for coupon ${couponCode}`);
};
