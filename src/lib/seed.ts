import { db } from "./firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AmbassadorApplication, AmbassadorProfile, Coupon, Order } from "@/types";

export const seedTestData = async () => {
    try {
        console.log("Starting Seeding Process...");

        // 1. Create a Test User/Ambassador
        const testAmbassadorId = "test-amb-001";
        const testCouponCode = "TESTHUB5";

        const ambProfile: AmbassadorProfile = {
            uid: testAmbassadorId,
            displayName: "Test Ambassador",
            email: "test@hub.com",
            couponCode: testCouponCode,
            totalEarnings: 25.50,
            referralCount: 3,
            status: "active",
            joinedAt: new Date()
        };
        await setDoc(doc(db, "ambassadors", testAmbassadorId), ambProfile);

        const couponData: Coupon = {
            id: testCouponCode,
            code: testCouponCode,
            discountType: "percentage",
            discountValue: 5,
            ambassadorId: testAmbassadorId,
            usageCount: 3,
            active: true,
            createdAt: new Date()
        };
        await setDoc(doc(db, "coupons", testCouponCode), couponData);

        // 2. Create some referral orders
        const ordersRef = collection(db, "orders");
        const dummyOrders = [
            {
                userId: "user-1",
                userName: "Kobby Mensah",
                email: "kobby@gmail.com",
                items: [
                    { productId: "p1", name: "UniShop Hoodie", price: 150, quantity: 1, image: "", trackingId: "t1" }
                ],
                total: 142.50, // After 5% disc
                status: "shipped",
                paymentStatus: "paid",
                shippingAddress: "Pent Hall, UG",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                couponCode: testCouponCode,
                ambassadorId: testAmbassadorId
            },
            {
                userId: "user-2",
                userName: "Ama Serwaa",
                email: "ama@gmail.com",
                items: [
                    { productId: "p2", name: "Tech Backpack", price: 200, quantity: 1, image: "", trackingId: "t2" }
                ],
                total: 190.00,
                status: "delivered",
                paymentStatus: "paid",
                shippingAddress: "Evandy, UPSA",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                couponCode: testCouponCode,
                ambassadorId: testAmbassadorId
            }
        ];

        for (const order of dummyOrders) {
            await addDoc(ordersRef, order);
        }

        // 3. Create a pending application
        await addDoc(collection(db, "ambassador_applications"), {
            userId: "user-3",
            displayName: "Prospective Lead",
            email: "lead@campus.com",
            status: "pending",
            appliedAt: serverTimestamp(),
            socialHandles: { instagram: "@lead_campus" },
            notes: "I have 5k followers on IG and want to help build the hub."
        });

        console.log("Seeding Complete!");
        return true;
    } catch (err) {
        console.error("Seeding failed:", err);
        throw err;
    }
};

// Export alias for consistency
export const initializeDatabase = seedTestData;

