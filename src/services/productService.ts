import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category } from "@/types";

// Fallback data derived from master-seed.js
const FALLBACK_CATEGORIES: Category[] = [
    { name: "Phones", iconName: "Smartphone", count: "210+ Items" },
    { name: "Tablets", iconName: "Smartphone", count: "40+ Items" },
    { name: "Laptops", iconName: "Laptop", count: "85+ Items" },
    { name: "Electronics", iconName: "Tv", count: "120+ Items" },
    { name: "Appliances", iconName: "HomeIcon", count: "140+ Items" },
    { name: "Clothing", iconName: "Layers", count: "180+ Items" },
    { name: "Shoes", iconName: "Zap", count: "95+ Items" },
    { name: "Accessories", iconName: "Headphones", count: "300+ Items" },
    { name: "Gaming", iconName: "Gamepad", count: "50+ Items" }
];

const FALLBACK_PRODUCTS: Product[] = [
    {
        id: "fb-1",
        name: "MacBook Pro M3 Max",
        description: "The ultimate power move for creators and developers. 14-inch Liquid Retina XDR display, M3 Max chip with 14-core CPU.",
        price: 28500,
        category: "Laptops",
        brand: "Apple",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"],
        stock: 15,
        status: "approved",
        featured: true,
        createdAt: new Date()
    },
    {
        id: "fb-2",
        name: "iPhone 15 Pro Max",
        description: "Titanium design, A17 Pro chip, customizable Action button, and a more versatile Pro camera system.",
        price: 18500,
        category: "Phones",
        brand: "Apple",
        images: ["https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800"],
        stock: 20,
        status: "approved",
        featured: true,
        createdAt: new Date()
    },
    {
        id: "fb-3",
        name: "iPad Pro M4",
        description: "The thinnest Apple product ever. Crushing performance with M4 chip.",
        price: 12000,
        category: "Tablets",
        brand: "Apple",
        images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800"],
        stock: 10,
        status: "approved",
        featured: true,
        createdAt: new Date()
    },
    {
        id: "fb-4",
        name: "Campus Hoodie",
        description: "Premium comfort for everyday campus life.",
        price: 450,
        category: "Clothing",
        brand: "Generic",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"],
        stock: 50,
        status: "approved",
        featured: true,
        createdAt: new Date()
    },
    {
        id: "fb-5",
        name: "Nike Air Force 1",
        description: "Classic sneakers for campus style.",
        price: 1200,
        category: "Shoes",
        brand: "Nike",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"],
        stock: 30,
        status: "approved",
        featured: true,
        createdAt: new Date()
    }
];

export const productService = {
    /**
     * Fetch all approved products
     */
    async getProducts(): Promise<Product[]> {
        try {
            const q = query(collection(db, "products"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.warn("Firestore products collection is empty. Using local fallback.");
                return FALLBACK_PRODUCTS;
            }

            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Product))
                .filter(p => p.status === "approved" || !p.status);
        } catch (error) {
            console.error("Error fetching products from Firestore:", error);
            return FALLBACK_PRODUCTS;
        }
    },

    /**
     * Fetch all categories
     */
    async getCategories(): Promise<Category[]> {
        try {
            const snapshot = await getDocs(collection(db, "categories"));
            if (snapshot.empty) {
                return FALLBACK_CATEGORIES;
            }
            const categories = snapshot.docs
                .map(doc => doc.data() as Category)
                .filter(cat => cat && typeof cat.name === 'string' && cat.name.trim().length > 0);

            if (categories.length === 0) {
                return FALLBACK_CATEGORIES;
            }
            return categories;
        } catch (error) {
            console.error("Error fetching categories from Firestore:", error);
            return FALLBACK_CATEGORIES;
        }
    },

    /**
     * Fetch site configuration
     */
    async getSiteConfig(): Promise<any> {
        try {
            const configDoc = await getDoc(doc(db, "settings", "siteConfig"));
            if (configDoc.exists()) {
                return configDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching site config:", error);
            return null;
        }
    }
};
