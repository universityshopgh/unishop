import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

export async function POST(req: Request) {
    try {
        const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));
        const productsDir = path.join(process.cwd(), 'public', 'images', 'products');

        if (!fs.existsSync(productsDir)) {
            return NextResponse.json({ error: 'Products directory not found' }, { status: 404 });
        }

        const files = fs.readdirSync(productsDir).filter(file =>
            ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.avif'].includes(path.extname(file).toLowerCase())
        );

        // 1. Group files by hash
        const hashMap: { [hash: string]: string[] } = {};
        files.forEach(file => {
            const hash = getFileHash(path.join(productsDir, file));
            if (!hashMap[hash]) hashMap[hash] = [];
            hashMap[hash].push(file);
        });

        const duplicates: { keep: string, remove: string[] }[] = [];
        Object.values(hashMap).forEach(group => {
            if (group.length > 1) {
                // Sort group to pick the "best" filename (shortest usually, or one without "Copy")
                group.sort((a, b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    const aCopy = aLower.includes('copy') || aLower.includes(' (');
                    const bCopy = bLower.includes('copy') || bLower.includes(' (');
                    if (aCopy && !bCopy) return 1;
                    if (!aCopy && bCopy) return -1;
                    return a.length - b.length;
                });

                const [keep, ...remove] = group;
                duplicates.push({ keep, remove });
            }
        });

        const results = {
            totalFiles: files.length,
            uniqueFiles: Object.keys(hashMap).length,
            duplicatesFound: duplicates.length,
            filesToRemove: duplicates.reduce((acc, d) => acc + d.remove.length, 0),
            duplicates,
            actions: [] as string[]
        };

        if (dryRun) {
            return NextResponse.json({ message: 'Dry run: No changes made', ...results });
        }

        // 2. Update Firestore products
        const productsSnap = await adminDb.collection('products').get();
        const batch = adminDb.batch();
        const mapping: { [oldName: string]: string } = {};
        duplicates.forEach(d => {
            d.remove.forEach(r => {
                mapping[`/images/products/${r}`] = `/images/products/${d.keep}`;
            });
        });

        // Tracking for product deduplication
        const seenProducts = new Set<string>();
        const productsToDelete: string[] = [];

        productsSnap.forEach(doc => {
            const data = doc.data();
            let updated = false;

            const newImages = (data.images || []).map((img: string) => {
                if (mapping[img]) {
                    updated = true;
                    return mapping[img];
                }
                return img;
            });

            // Simple key to identify identical products: Name + Price + First Image
            const firstImage = newImages[0] || '';
            const productKey = `${data.name}|${data.price}|${firstImage}`.toLowerCase().trim();

            if (seenProducts.has(productKey)) {
                productsToDelete.push(doc.id);
                batch.delete(doc.ref);
                results.actions.push(`Deleted duplicate product: ${data.name} (${doc.id})`);
            } else {
                seenProducts.add(productKey);
                if (updated) {
                    batch.update(doc.ref, { images: newImages, updatedAt: new Date() });
                    results.actions.push(`Updated product images for: ${data.name}`);
                }
            }
        });

        await batch.commit();

        // 3. Delete files
        duplicates.forEach(d => {
            d.remove.forEach(r => {
                const filePath = path.join(productsDir, r);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    results.actions.push(`Deleted file: ${r}`);
                }
            });
        });

        return NextResponse.json({ message: 'Deduplication complete', ...results });

    } catch (error: any) {
        console.error('[Deduplicate Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
