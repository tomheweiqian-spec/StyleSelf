import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StyleSelf — Virtual Try-On",
  description:
    "Try on any clothing, shoes, accessories, or hairstyles virtually before you buy. Powered by AI.",
  keywords: ["virtual try-on", "fashion", "AI styling", "wardrobe"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-ss-bg font-sans">{children}</body>
    </html>
  );
}
