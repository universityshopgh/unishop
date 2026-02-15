import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const initCouponSystem = async () => {
    const couponConfig = {
        isEnabled: true,
        lastUpdated: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "site_config", "coupons_global"), couponConfig);
        console.log("✅ Coupon System Initialized: Global status is enabled.");
    } catch (error) {
        console.error("❌ Failed to initialize Coupon System:", error);
    }
};

initCouponSystem();
