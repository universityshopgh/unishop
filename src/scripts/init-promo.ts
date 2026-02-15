import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const initPromo = async () => {
    const promoConfig = {
        isEnabled: true,
        discountPercent: 5,
        name: "Valentine's Special",
        startDate: "2026-02-01T00:00:00Z",
        endDate: "2026-03-14T23:59:59Z"
    };

    try {
        await setDoc(doc(db, "site_config", "promotions"), promoConfig);
        console.log("✅ Promo Protocol Initialized: Valentine's Special is active.");
    } catch (error) {
        console.error("❌ Failed to initialize Promo Protocol:", error);
    }
};

initPromo();
