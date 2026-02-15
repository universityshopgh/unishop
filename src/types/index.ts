import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    email: string | null;
    username: string;
    displayName: string | null;
    photoURL: string | null;
    role: 'customer' | 'admin' | 'ambassador';
    createdAt: Timestamp | Date;
    address?: string;
    phoneNumber?: string | null;
    phoneVerified?: boolean;
    phoneVerifiedAt?: Timestamp | Date;
}

export interface ProductVariant {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    brand: string;
    images: string[];
    variants?: ProductVariant[];
    stock: number;

    createdAt: Timestamp | Date;
    featured?: boolean;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Order {
    id: string;
    orderId: string; // Human-readable ID
    userId: string;
    userName: string;
    email: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    shippingAddress: string;
    address?: string;
    phone?: string;
    paymentReference?: string;
    createdAt: Timestamp | Date;
    couponCode?: string;
    referralProfit?: number;
    ambassadorId?: string;
}

export interface CartItem {
    productId: string;
    trackingId: string;
    name: string;
    price: number; // This will be the current price (discounted or original) based on context
    basePrice: number; // Original price before any discounts
    quantity: number;
    image: string;
}

export interface AmbassadorApplication {
    id: string;
    userId: string;
    displayName: string;
    email: string;
    status: 'pending' | 'scheduled' | 'approved' | 'rejected';
    appliedAt: Timestamp | Date;
    appointmentId?: string;
    notes?: string;
    socialHandles?: {
        instagram?: string;
        tiktok?: string;
        facebook?: string;
    };
}

export interface Appointment {
    id: string;
    ambassadorId: string; // userId of applicant
    startTime: Timestamp | Date;
    duration: number; // in minutes
    status: 'scheduled' | 'completed' | 'cancelled';
    link?: string; // Meeting link
    createdAt: Timestamp | Date;
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    ambassadorId: string;
    usageCount: number;
    active: boolean;
    createdAt: Timestamp | Date;
}

export interface AmbassadorProfile {
    uid: string;
    displayName: string;
    email: string;
    couponCode: string;
    totalEarnings: number;
    referralCount: number;
    monthlyEarnings?: { [monthYear: string]: number };
    status: 'active' | 'suspended';
    joinedAt: Timestamp | Date;
}

export interface Category {
    name: string;
    icon?: any;
    iconName: string;
    count: string;
}

export interface AdminStats {
    totalUsers: number;
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    revenueTrend: number;
    ordersTrend: number;
    usersTrend: number;
    productsTrend: number;
    totalStock: number;
    verifiedUsers: number;
}
