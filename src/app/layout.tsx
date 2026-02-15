import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "University Shop",
  description: "The ultimate e-commerce destination for students. Quality gadgets, lifestyle essentials, and more with instant campus delivery.",
  keywords: ["campus shop", "university marketplace", "student discounts", "laptops", "phones", "University Shop"],
  openGraph: {
    title: "University Shop",
    description: "Affordability at its best. Exclusive campus deals.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-flyer-light text-slate-900 min-h-screen flex flex-col`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
