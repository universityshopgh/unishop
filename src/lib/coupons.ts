import { getDynamicPromoConfig, isPromoActive } from "./promoUtils";
import { db } from "./firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { Coupon } from "@/types";


/**
 * Validates a coupon code.
 * Rules:
 * 1. Site-wide promotions take precedence (Coupons disabled during promo).
 * 2. Coupon must exist in Firestore and be active.
 */
export const validateCoupon = async (code: string) => {
    // 1. Check for site-wide promotion
    const promoConfig = await getDynamicPromoConfig();
    if (isPromoActive(promoConfig)) {
        return {
            valid: false,
            error: `Hub Alert: Coupons are currently offline during the ${promoConfig.name}. Enjoy the automatic discount!`
        };
    }

    // 2. Check for global coupon system status
    try {
        const couponConfigRef = doc(db, "site_config", "coupons_global");
        const couponConfigSnap = await getDoc(couponConfigRef);
        if (couponConfigSnap.exists() && !couponConfigSnap.data().isEnabled) {
            return {
                valid: false,
                error: "System Alert: The ambassador coupon system is currently offline. Please check back later."
            };
        }
    } catch (err) {
        console.error("Error checking global coupon status:", err);
    }

    try {
        const couponsRef = collection(db, "coupons");
        const q = query(couponsRef, where("code", "==", code.toUpperCase()), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { valid: false, error: "Invalid Protocol: Coupon code not found in central registry." };
        }

        const couponData = querySnapshot.docs[0].data() as Coupon;

        if (!couponData.active) {
            return { valid: false, error: "Suspended Access: This coupon is currently inactive." };
        }

        return {
            valid: true,
            coupon: { ...couponData, id: querySnapshot.docs[0].id },
            discountPercent: couponData.discountType === 'percentage' ? couponData.discountValue : 5 // Default to 5% if not specified
        };

    } catch (error) {
        console.error("Coupon Verification Error:", error);
        return { valid: false, error: "Handshake Error: Failed to verify coupon integrity." };
    }
};

export const calculateCouponDiscount = (price: number, discountPercent: number) => {
    return price * (discountPercent / 100);
};
