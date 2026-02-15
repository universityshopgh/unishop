import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// We avoid using firebase-admin for auth verification here to bypass the "Could not load default credentials" error 
// in local environments without a service account key. 
// For local development, we'll perform a basic check. In production, a service account is required.

export async function POST(request: NextRequest) {
    try {
        // 1. AUTHENTICATION CHECK (Simplified for local dev)
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized: Missing Token" }, { status: 401 });
        }

        // Note: Without a service account, we cannot securely verify the token on the server.
        // For local development purposes, we will proceed as long as a token is present.
        // CAUTION: This should be strengthened for production using a service account or firebase-admin.

        // 2. FILE VALIDATION
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate File Type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        // 3. SAVE LOCALLY
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public/images/products");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, buffer);

        // Return the local URL
        const publicUrl = `/images/products/${filename}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error("Local upload error:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}
