import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    return NextResponse.json({
        hasPublicKey: !!publicKey,
        hasSecretKey: !!secretKey,
        publicKeyPrefix: publicKey ? publicKey.substring(0, 7) : null,
        secretKeyPrefix: secretKey ? secretKey.substring(0, 7) : null,
        nodeEnv: process.env.NODE_ENV
    });
}
