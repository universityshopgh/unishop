import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));
        const productsDir = path.join(process.cwd(), 'public', 'images', 'products');

        // 1. Identify local files with "copy"
        const localToRemove: string[] = [];
        if (fs.existsSync(productsDir)) {
            const files = fs.readdirSync(productsDir);
            files.forEach(file => {
                if (file.toLowerCase().includes('copy')) {
                    localToRemove.push(file);
                }
            });
        }

        // 2. Identify Firestore products with "copy"
        const productsSnap = await adminDb.collection('products').get();
        const productsToRemove: { id: string, name: string }[] = [];

        productsSnap.forEach(doc => {
            const data = doc.data();
            const nameMatch = data.name?.toLowerCase().includes('copy');
            const imageMatch = (data.images || []).some((img: string) => img.toLowerCase().includes('copy'));

            if (nameMatch || imageMatch) {
                productsToRemove.push({ id: doc.id, name: data.name });
            }
        });

        const results = {
            localFilesCount: localToRemove.length,
            firestoreProductsCount: productsToRemove.length,
            localToRemove,
            firestoreProductsToRemove: productsToRemove,
            actions: [] as string[]
        };

        if (dryRun) {
            return NextResponse.json({ message: 'Dry run: No changes made', ...results });
        }

        // 3. Perform Firestore Deletion
        if (productsToRemove.length > 0) {
            const batch = adminDb.batch();
            productsToRemove.forEach(p => {
                batch.delete(adminDb.collection('products').doc(p.id));
                results.actions.push(`Deleted Firestore product: ${p.name} (${p.id})`);
            });
            await batch.commit();
        }

        // 4. Perform Local Deletion
        localToRemove.forEach(file => {
            const filePath = path.join(productsDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                results.actions.push(`Deleted local file: ${file}`);
            }
        });

        return NextResponse.json({ message: 'Cleanup complete', ...results });

    } catch (error: any) {
        console.error('[Cleanup Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
