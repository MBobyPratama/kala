"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKala, PrelovedItem } from "@/app/context/KalaContext";
import { ShoppingBag, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight, Share2, Heart } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PDPProps {
  params: Promise<{
    username: string;
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: PDPProps) {
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;
  
  const { items, trackClick } = useKala();
  const [item, setItem] = useState<PrelovedItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const matched = items.find((i) => i.id === itemId);
    if (matched) {
      setItem(matched);
      if (matched.imageUrls && matched.imageUrls.length > 0) {
        setSelectedImage(matched.imageUrls[0]);
      }
    } else {
      // Fetch item directly from API if not found in global items (e.g. if it is sold or archived)
      const fetchItemDetails = async () => {
        try {
          const res = await fetch(`/api/items/${itemId}`);
          if (res.ok) {
            const data = await res.json();
            setItem(data);
            if (data.imageUrls && data.imageUrls.length > 0) {
              setSelectedImage(data.imageUrls[0]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch item details:", error);
        }
      };
      fetchItemDetails();
    }
  }, [items, itemId]);

  // Copy product link to clipboard
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!item) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-32 bg-[#f5f5f5] px-4">
          <div className="text-center max-w-sm bg-white border border-[#cacacb] p-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-[#707072] mb-4" />
            <h2 className="text-lg font-bold text-[#111111] uppercase tracking-wider">Produk Tidak Ditemukan</h2>
            <p className="text-xs text-[#707072] mt-2 mb-6 leading-relaxed">
              Barang yang Anda cari mungkin sudah laku terjual, diarsipkan oleh penjual, atau tautan salah.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-black text-white font-semibold text-xs h-10 px-6 rounded-full hover:bg-zinc-800 transition-all"
            >
              Kembali ke Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Format IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Get condition pill style details
  const getConditionStyle = (cond: string) => {
    if (cond.includes("10/10") || cond.includes("9/10")) {
      return "bg-[#007d48]/10 text-[#007d48] border-[#007d48]/20";
    }
    if (cond.includes("8/10")) {
      return "bg-[#b25e00]/10 text-[#b25e00] border-[#b25e00]/20";
    }
    return "bg-[#4b4b4d]/10 text-[#4b4b4d] border-[#4b4b4d]/20";
  };

  const handleOutboundRedirect = (platform: "Shopee" | "Tokopedia", url: string) => {
    trackClick(item.id, platform);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 md:py-16">
        {/* Breadcrumb nav */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#707072] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-black">Katalog Kala</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${item.sellerUsername}`} className="hover:text-black">@{item.sellerUsername}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#111111] truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
        </nav>

        {/* Product details grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (60% Desktop Grid Block - Gallery and description) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Gallery Image Display */}
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square bg-[#f5f5f5] overflow-hidden border border-[#e5e5e5] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="bg-white border-2 border-black text-black font-display text-lg tracking-widest uppercase px-6 py-2 rotate-[-5deg] select-none">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails grid */}
              {item.imageUrls && item.imageUrls.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {item.imageUrls.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 bg-[#f5f5f5] flex-shrink-0 border-2 transition-all ${
                        selectedImage === img ? "border-black scale-[0.98]" : "border-transparent opacity-80"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`${item.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Description Block */}
            <div className="bg-white border-t border-[#e5e5e5] pt-8">
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-4">Deskripsi Barang</h3>
              <div className="text-sm text-[#39393b] leading-relaxed whitespace-pre-wrap font-light">
                {item.description}
              </div>
            </div>

            {/* Quality Commitment Section (Trust builder) */}
            <div className="p-6 bg-[#f5f5f5] border border-[#cacacb] flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#007d48] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Garansi Transaksi Aman</h4>
                <p className="text-[11px] text-[#707072] mt-1 leading-relaxed">
                  Semua transaksi diproses melalui escrow Shopee atau Tokopedia. Anda terlindungi dari penipuan transfer DMs. Barang dijamin sesuai deskripsi atau uang kembali melalui garansi marketplace yang bersangkutan.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (40% Desktop Grid Block - Sticky Checkout Box) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6 bg-white border border-[#cacacb] p-8">
            
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <span className={`text-[10px] font-bold px-3 py-1 border rounded-full uppercase tracking-wider ${getConditionStyle(item.condition)}`}>
                  {item.condition}
                </span>
                
                {/* Share and wishlist actions */}
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 rounded-full hover:bg-[#f5f5f5] border border-[#cacacb] transition-all text-[#111111]"
                    title="Salin Tautan"
                  >
                    {isCopied ? (
                      <span className="text-[10px] font-bold text-[#007d48]">Tersalin</span>
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full border transition-all ${
                      isLiked ? "bg-[#d30005]/10 border-[#d30005] text-[#d30005]" : "hover:bg-[#f5f5f5] border-[#cacacb] text-[#111111]"
                    }`}
                    title="Simpan ke Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-[#d30005]" : ""}`} />
                  </button>
                </div>
              </div>

              <h1 className="font-sans font-bold text-xl sm:text-2xl text-[#111111] leading-tight tracking-wide mb-3">
                {item.name}
              </h1>

              {/* Price displays */}
              <div className="py-4 border-y border-[#e5e5e5] my-4 flex items-center justify-between">
                <div>
                  <span className={`text-2xl sm:text-3xl font-display tracking-tight ${item.isSold ? "text-[#707072] line-through" : "text-[#111111]"}`}>
                    {formatIDR(item.price)}
                  </span>
                  <span className="text-[10px] font-semibold text-[#707072] block mt-0.5 uppercase tracking-wider">
                    Harga Mati (Nett Price)
                  </span>
                </div>
                <div className="bg-black text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-none">
                  {item.isSold ? "SOLD OUT" : "Fixed Price"}
                </div>
              </div>
            </div>

            {/* Outbound Routers */}
            <div className="flex flex-col gap-3">
              {item.isSold ? (
                <div className="w-full bg-[#f5f5f5] border border-[#cacacb] text-[#707072] font-bold text-sm h-12 rounded-full flex items-center justify-center gap-2 select-none">
                  <ShoppingBag className="w-4 h-4 text-[#9e9ea0]" />
                  <span>BARANG SUDAH TERJUAL (SOLD OUT)</span>
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block mb-1">
                    Beli Sekarang Lewat Marketplace:
                  </span>

                  {item.shopeeUrl ? (
                    <button
                      onClick={() => handleOutboundRedirect("Shopee", item.shopeeUrl!)}
                      className="w-full bg-[#EE4D2D] hover:bg-[#d63d1e] text-white font-bold text-sm h-12 rounded-full transition-all flex items-center justify-center gap-3 group"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>Beli via Shopee</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm font-semibold opacity-85 group-hover:opacity-100">
                        Aman & COD
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-[#f5f5f5] text-[#9e9ea0] border border-[#cacacb] font-bold text-sm h-12 rounded-full cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Shopee Belum Tersedia</span>
                    </button>
                  )}

                  {item.tokopediaUrl ? (
                    <button
                      onClick={() => handleOutboundRedirect("Tokopedia", item.tokopediaUrl!)}
                      className="w-full bg-[#03AC0E] hover:bg-[#028b0b] text-white font-bold text-sm h-12 rounded-full transition-all flex items-center justify-center gap-3 group"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>Beli via Tokopedia</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm font-semibold opacity-85 group-hover:opacity-100">
                        Cicilan 0%
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-[#f5f5f5] text-[#9e9ea0] border border-[#cacacb] font-bold text-sm h-12 rounded-full cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Tokopedia Belum Tersedia</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-[#707072] leading-relaxed pt-2 border-t border-[#e5e5e5] italic">
              * Transaksi diproses secara aman melalui sistem e-commerce yang Anda pilih. Harga bersifat mutlak, bebas dari kerumitan tawar-menawar. Outbound click dihitung untuk analitik penjual.
            </p>

            {/* Seller profile block */}
            <div className="mt-4 pt-4 border-t border-[#e5e5e5] flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#f5f5f5] rounded-full overflow-hidden flex-shrink-0">
                {/* Visual placeholder avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://images.unsplash.com/photo-${item.sellerUsername === "siti" ? "1494790108377-be9c29b29330" : "1507003211169-0a1dd7228f2d"}?w=80&auto=format&fit=crop&q=80`} 
                  alt={item.sellerName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#707072] uppercase tracking-wider block">Penjual Terverifikasi</span>
                <Link 
                  href={`/${item.sellerUsername}`} 
                  className="text-sm font-bold text-[#111111] hover:underline truncate block"
                >
                  {item.sellerName} (@{item.sellerUsername})
                </Link>
              </div>
              <Link
                href={`/${item.sellerUsername}`}
                className="text-xs font-bold text-black border border-black rounded-full px-4 py-1.5 hover:bg-[#f5f5f5] transition-all"
              >
                Kunjungi Toko
              </Link>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
