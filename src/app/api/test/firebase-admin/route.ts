import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET() {
    try {
        console.log('[Firebase Test] Testing Firebase Admin SDK...');

        // Test 1: Check if adminDb exists
        if (!adminDb) {
            return Response.json({
                error: 'adminDb is undefined',
                hint: 'Firebase Admin SDK not initialized'
            }, { status: 500 });
        }

        console.log('[Firebase Test] adminDb exists');

        // Test 2: Try to access Firestore
        try {
            const testRef = adminDb.collection('_test').doc('test');
            await testRef.set({ test: true, timestamp: Date.now() });
            await testRef.delete();

            console.log('[Firebase Test] Firestore write/delete successful');

            return Response.json({
                success: true,
                message: 'Firebase Admin SDK is working correctly',
                tests: {
                    adminDb: 'OK',
                    firestoreWrite: 'OK',
                    firestoreDelete: 'OK'
                }
            });
        } catch (firestoreError: any) {
            console.error('[Firebase Test] Firestore error:', firestoreError);
            return Response.json({
                error: 'Firestore operation failed',
                details: firestoreError.message,
                code: firestoreError.code,
                hint: 'Check Firebase Admin credentials in .env.local'
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[Firebase Test] Error:', error);
        return Response.json({
            error: 'Firebase Admin test failed',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
