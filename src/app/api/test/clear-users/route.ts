import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    try {
        console.log("⚠️ Starting User Cleanup...");

        // 1. Delete all users from Firebase Authentication
        const listUsersResult = await adminAuth.listUsers(1000);
        const uids = listUsersResult.users.map((user) => user.uid);

        if (uids.length > 0) {
            await adminAuth.deleteUsers(uids);
            console.log(`✅ Deleted ${uids.length} users from Auth.`);
        } else {
            console.log("ℹ️ No users found in Auth.");
        }

        // 2. Delete all documents in 'users' collection
        const usersRef = adminDb.collection('users');
        const usersSnapshot = await usersRef.get();

        if (!usersSnapshot.empty) {
            const batch = adminDb.batch();
            usersSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${usersSnapshot.size} docs from 'users' collection.`);
        } else {
            console.log("ℹ️ No docs found in 'users' collection.");
        }

        // 3. Delete all documents in 'usernames' collection
        const usernamesRef = adminDb.collection('usernames');
        const usernamesSnapshot = await usernamesRef.get();

        if (!usernamesSnapshot.empty) {
            const batch = adminDb.batch();
            usernamesSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${usernamesSnapshot.size} docs from 'usernames' collection.`);
        } else {
            console.log("ℹ️ No docs found in 'usernames' collection.");
        }

        // 4. Delete all documents in 'otp_codes' collection
        const otpRef = adminDb.collection('otp_codes');
        const otpSnapshot = await otpRef.get();

        if (!otpSnapshot.empty) {
            const batch = adminDb.batch();
            otpSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${otpSnapshot.size} docs from 'otp_codes' collection.`);
        }

        return NextResponse.json({ success: true, message: "All users and data cleared successfully." });

    } catch (error: any) {
        console.error("Cleanup Error:", error);
        return NextResponse.json({ error: "Failed to clear users", details: error.message }, { status: 500 });
    }
}
