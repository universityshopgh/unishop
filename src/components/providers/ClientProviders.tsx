"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/common/WhatsAppFloating";
import ScrollToTop from "@/components/common/ScrollToTop";

import { ConfigProvider } from "@/context/ConfigContext";


export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider>
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <main className="flex-grow pt-16">
                        {children}
                    </main>
                    <Footer />
                    <WhatsAppFloating />
                    <ScrollToTop />
                </CartProvider>
            </AuthProvider>
        </ConfigProvider>
    );
}
