
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function clearOrders() {
    console.log('Clearing orders collection...');
    const snapshot = await db.collection('orders').get();

    if (snapshot.empty) {
        console.log('No orders to delete.');
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} orders.`);
}

clearOrders().catch(console.error);
