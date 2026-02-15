"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    Home as HomeIcon, Smartphone, Laptop, Tv,
    Gamepad, Watch, Headphones, Layers, MessageCircle,
    Facebook, Instagram, Search, ShoppingBag, Zap,
    ChevronRight, ArrowRight, Heart, Sparkles, User,
    LogOut, Settings, Package, History
} from "lucide-react";
import { productService } from "@/services/productService";

// Icon mapping for dynamic category/social icons
const ICON_MAP: { [key: string]: any } = {
    HomeIcon, Smartphone, Laptop, Tv, Gamepad, Watch,
    Headphones, Layers, MessageCircle, Facebook, Instagram,
    "Tiktok": Zap // Placeholder for Tiktok if not in Lucide
};

// Site Configuration Interfaces
export interface SiteConfig {
    brand: {
        name: string;
        suffix: string;
        tagline: string;
        description: string;
        email: string;
        phone?: string;
        whatsapp?: string;
    };
    siteMeta: {
        protocol: string;
        copyrightName: string;
        year: string;
    };
    navigation: {
        main: Array<{ label: string; href: string }>;
        explore: Array<{ label: string; href: string }>;
        support: Array<{ label: string; href: string }>;
    };
    socials: Array<{ platform: string; href: string; icon: string }>;
    contact: {
        whatsapp: string;
    };
}

export interface Category {
    name: string;
    icon?: any;
    iconName?: string;
    count: string;
}

interface ConfigContextType {
    config: SiteConfig | null;
    categories: Category[];
    loading: boolean;
    getIcon: (name: string) => any;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const getIcon = (name: string) => ICON_MAP[name] || HelpCircle;

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Fetch Site Config via Service
                const siteConfig = await productService.getSiteConfig();
                if (siteConfig) {
                    setConfig(siteConfig as SiteConfig);
                }

                // Fetch Categories via Service
                const catData = await productService.getCategories();
                const processedCategories = catData.map(cat => ({
                    ...cat,
                    // Check both iconName (from type) and icon (from seed)
                    icon: ICON_MAP[cat.iconName || (cat as any).icon] || HelpCircle,
                }));
                setCategories(processedCategories);
            } catch (error) {
                console.error("Error fetching shop configuration:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, categories, loading, getIcon }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
}

const HelpCircle = () => <div className="w-4 h-4 rounded-full bg-slate-200" />;
