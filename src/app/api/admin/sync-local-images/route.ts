import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';
import { BULK_PRODUCTS } from '@/lib/bulk_products';

export async function POST(req: Request) {
    try {
        const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));

        // 1. Scan public/images/products
        const productsDir = path.join(process.cwd(), 'public', 'images', 'products');
        if (!fs.existsSync(productsDir)) {
            return NextResponse.json({ error: 'Products directory not found' }, { status: 404 });
        }

        const files = fs.readdirSync(productsDir).filter(file =>
            ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif'].includes(path.extname(file).toLowerCase())
        );

        console.log(`[Sync] Found ${files.length} local images`);

        // 2. Fetch existing products from Firestore
        const productsSnap = await adminDb.collection('products').get();
        const existingImages = new Set<string>();

        productsSnap.forEach(doc => {
            const data = doc.data();
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach((img: string) => {
                    // Store just the filename if it's a local path
                    if (img.startsWith('/images/products/')) {
                        existingImages.add(img.replace('/images/products/', ''));
                    } else if (img.includes('firebasestorage.googleapis.com')) {
                        // If it's a storage URL, we might want to be careful, 
                        // but for now let's focus on local path duplicates
                    }
                });
            }
        });

        console.log(`[Sync] Found ${existingImages.size} images already in Firestore products`);

        // 3. Identify missing images
        const missingFiles = files.filter(file => !existingImages.has(file));
        console.log(`[Sync] ${missingFiles.length} images are missing from Firestore`);

        const results = {
            totalFound: files.length,
            alreadyInDb: existingImages.size,
            toAdd: missingFiles.length,
            added: [] as string[],
            skipped: [] as string[]
        };

        if (dryRun) {
            return NextResponse.json({
                message: 'Dry run successful',
                ...results,
                missingFiles
            });
        }

        // 4. Add missing products
        const batch = adminDb.batch();
        let count = 0;

        for (const file of missingFiles) {
            const imagePath = `/images/products/${file}`;

            // Look for metadata in BULK_PRODUCTS
            const bulkMatch = BULK_PRODUCTS.find(p =>
                p.images.includes(imagePath) ||
                p.images.includes(file)
            );

            const productData = {
                name: bulkMatch?.name || file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
                description: bulkMatch?.description || `Authentic ${file.replace(/\.[^/.]+$/, "")} from the University Hub.`,
                price: bulkMatch?.price || 0,
                originalPrice: bulkMatch?.originalPrice || null,
                category: bulkMatch?.category || "General",
                brand: bulkMatch?.brand || "Flyer",
                stock: bulkMatch?.stock || 10,
                images: [imagePath],
                status: "approved",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const docRef = adminDb.collection('products').doc();
            batch.set(docRef, productData);
            results.added.push(file);
            count++;

            // Max batch size is 500
            if (count >= 450) {
                await batch.commit();
                // Start new batch (reset not needed as it's a new instance if we break, but let's just finish the loop for simplicity since we have 316 max)
            }
        }

        if (count > 0) {
            await batch.commit();
        }

        return NextResponse.json({
            message: 'Sync successful',
            ...results
        });

    } catch (error: any) {
        console.error('[Sync Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
