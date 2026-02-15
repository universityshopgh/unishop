import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, Timestamp, orderBy, limit } from "firebase/firestore";
import { notifyHub } from "@/lib/notificationHub";

export async function POST(req: NextRequest) {
    try {
        const { action, phone, email, otp, channel, name } = await req.json();

        // Identifier for storing OTP (use email if channel is email, otherwise phone)
        let identifier = (channel === 'email' && email) ? email.toLowerCase() : phone;
        identifier = String(identifier || "").trim();

        if (!identifier && action !== 'welcome') {
            console.error("[OTP] Missing identifier for action:", action);
            return NextResponse.json({ error: "Missing identifier (phone or email)" }, { status: 400 });
        }

        // Action: Send Welcome Message (Direct Trigger)
        if (action === 'welcome') {
            await notifyHub({
                action: 'welcome',
                email: email?.toLowerCase(),
                phone: phone,
                name: name || "Citizen",
                channel: channel
            });
            return NextResponse.json({ success: true });
        }

        // Action: Send OTP
        if (action === 'send') {
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            await notifyHub({
                action: 'otp',
                email: email?.toLowerCase(),
                phone: phone,
                code: code,
                channel: channel
            });

            // Store in Firestore for verification
            await addDoc(collection(db, "otps"), {
                identifier,
                code,
                createdAt: Timestamp.now(),
                expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000), // 10 mins
                attempts: 0
            });

            return NextResponse.json({ success: true });
        }

        // Action: Verify OTP
        if (action === 'verify') {
            if (!otp) return NextResponse.json({ error: "OTP required" }, { status: 400 });

            const q = query(
                collection(db, "otps"),
                where("identifier", "==", identifier)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
            }

            const docs = [...querySnapshot.docs].sort((a, b) => {
                const aTime = a.data().createdAt?.toMillis?.() || 0;
                const bTime = b.data().createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });

            const otpDoc = docs[0];
            const otpData = otpDoc.data();

            // Check expiry
            const expiresAt = otpData.expiresAt?.toDate?.() || new Date(0);
            if (expiresAt < new Date()) {
                await deleteDoc(otpDoc.ref);
                return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
            }

            // Verify code
            const receivedCode = String(otp || "").trim();
            const expectedCode = String(otpData.code || "").trim();

            console.log(`[OTP VERIFY] Identifier: ${identifier}`);
            console.log(`[OTP VERIFY] Expected: "${expectedCode}"`);
            console.log(`[OTP VERIFY] Received: "${receivedCode}"`);

            if (expectedCode !== receivedCode) {
                return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
            }

            // Success: Clean up
            await deleteDoc(otpDoc.ref);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("OTP API Error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
