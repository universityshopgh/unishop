import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    // Try to use service account from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    console.log('[Firebase Admin] Initializing...');
    console.log('[Firebase Admin] Service account exists:', !!serviceAccount);
    console.log('[Firebase Admin] Service account length:', serviceAccount?.length || 0);

    if (serviceAccount) {
        try {
            console.log('[Firebase Admin] Parsing service account JSON...');
            const parsedServiceAccount = JSON.parse(serviceAccount);
            console.log('[Firebase Admin] Project ID:', parsedServiceAccount.project_id);
            console.log('[Firebase Admin] Client email:', parsedServiceAccount.client_email);

            admin.initializeApp({
                credential: admin.credential.cert(parsedServiceAccount)
            });
            console.log('[Firebase Admin] ✅ Initialized with service account credentials');
        } catch (error: any) {
            console.error("[Firebase Admin] ❌ Failed to parse/initialize:", error.message);
            console.error("[Firebase Admin] Error details:", error);
            // Fallback to default initialization
            admin.initializeApp({
                projectId: "unishop-15bb5",
            });
            console.log('[Firebase Admin] ⚠️ Initialized with default config (NO CREDENTIALS - will fail)');
        }
    } else {
        console.log('[Firebase Admin] ⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
        // Use default initialization (works in some environments like Firebase hosting)
        admin.initializeApp({
            projectId: "unishop-15bb5",
        });
        console.log('[Firebase Admin] ⚠️ Initialized with default config (NO CREDENTIALS - will fail)');
    }
} else {
    console.log('[Firebase Admin] Already initialized');
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
