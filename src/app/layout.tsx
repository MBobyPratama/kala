import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import { KalaProvider } from "@/app/context/KalaContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kala Preloved Hub | Personal Thrift Storefronts",
  description: "Create a curated digital garage sale storefront, list your preloved items with fixed prices, and route buyers to Shopee or Tokopedia checkouts securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111111] selection:bg-[#111111] selection:text-white">
        <KalaProvider>
          {children}
        </KalaProvider>
      </body>
    </html>
  );
}
