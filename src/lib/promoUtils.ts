import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export interface PromoConfig {
    isEnabled: boolean;
    discountPercent: number;
    startDate: string;
    endDate: string;
    name: string;
}

// Fallback hardcoded config
export const FALLBACK_PROMO_CONFIG: PromoConfig = {
    isEnabled: true,
    discountPercent: 5,
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-03-14T23:59:59Z',
    name: "Valentine's Special"
};

/**
 * Fetches the current site-wide promotion configuration from Firestore.
 */
export const getDynamicPromoConfig = async (): Promise<PromoConfig> => {
    try {
        const docRef = doc(db, "site_config", "promotions");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as PromoConfig;
        }
    } catch (error) {
        console.error("Error fetching promo config:", error);
    }
    return FALLBACK_PROMO_CONFIG;
};

export const isPromoActive = (config?: PromoConfig) => {
    if (!config || !config.isEnabled) return false;
    const now = new Date();
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    return now >= start && now <= end;
};

export const getDiscountedPrice = (price: number, config: PromoConfig = FALLBACK_PROMO_CONFIG) => {
    if (!isPromoActive(config)) return price;
    const discount = price * (config.discountPercent / 100);
    return price - discount;
};

export const getDiscountAmount = (price: number, config: PromoConfig = FALLBACK_PROMO_CONFIG) => {
    return price * (config.discountPercent / 100);
};
