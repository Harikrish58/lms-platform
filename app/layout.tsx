import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NextEra",
    template: "%s | NextEra",
  },
  description: "Modern Learning Management System built with Next.js",
  applicationName: "NextEra",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main id="main-content" className="flex-1">
              {children}
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}