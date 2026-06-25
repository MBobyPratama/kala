"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKala, PrelovedItem } from "@/app/context/KalaContext";
import { Share2, ShoppingBag, Store, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface StorefrontProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserStorefrontPage({ params }: StorefrontProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  
  const { items, users } = useKala();
  const [sellerName, setSellerName] = useState("");
  const [sellerAvatar, setSellerAvatar] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Find seller name
    const matchedUser = users.find((u) => u.username?.toLowerCase() === username.toLowerCase());
    if (matchedUser) {
      setSellerName(matchedUser.name);
      setSellerAvatar(matchedUser.avatar);
    } else {
      // Fallback
      setSellerName(username.charAt(0).toUpperCase() + username.slice(1));
      setSellerAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
    }
  }, [users, username]);

  // Copy storefront link
  const handleCopyStoreLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Filter items for this seller only
  const sellerItems = items.filter((item) => {
    // Exclude archived items
    if (item.isArchived) return false;
    
    // Match username
    if (item.sellerUsername.toLowerCase() !== username.toLowerCase()) return false;

    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  // Calculate stats
  const activeCount = sellerItems.filter((i) => !i.isSold).length;
  const soldCount = sellerItems.filter((i) => i.isSold).length;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 md:py-16">
        
        {/* Profile Onboarding/Header Block (DESIGN.md section 5.2.1 sub-nav styled profile header) */}
        <section className="bg-[#f5f5f5] border border-[#cacacb] p-8 md:p-12 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white border border-[#cacacb] rounded-full overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sellerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt={sellerName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111111] uppercase tracking-wide">
                  {sellerName}
                </h1>
                <span className="bg-[#007d48]/10 text-[#007d48] border border-[#007d48]/20 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
                  Verified Seller
                </span>
              </div>
              <p className="text-sm font-semibold text-[#707072] mt-0.5">
                kala.id/@{username}
              </p>
              
              {/* Profile stats */}
              <div className="flex items-center gap-4 mt-3 text-xs font-semibold uppercase tracking-wider text-[#39393b]">
                <span>{activeCount} Listing Aktif</span>
                <span>•</span>
                <span>{soldCount} Terjual</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyStoreLink}
              className="bg-white border border-black hover:bg-[#f5f5f5] text-[#111111] font-bold text-xs h-10 px-5 rounded-full transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{isCopied ? "Tersalin!" : "Salin Link Toko"}</span>
            </button>
            <Link
              href="/"
              className="bg-black text-white hover:bg-zinc-800 font-bold text-xs h-10 px-5 rounded-full transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Jelajah Kala Hub</span>
            </Link>
          </div>
        </section>

        {/* Search inside seller's store */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-6 mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="font-sans font-bold text-lg uppercase tracking-wider text-[#111111]">
              KATALOG BARANG @{username}
            </h2>
            <p className="text-xs text-[#707072] mt-0.5 font-semibold">
              Menampilkan barang thrift terkurasi miliki {sellerName}
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari di toko ini..."
              className="w-full h-9 px-3 bg-[#f5f5f5] text-[#111111] text-xs rounded-none border border-[#cacacb] outline-none focus:bg-white focus:border-[#111111]"
            />
          </div>
        </div>

        {/* Seller product grid */}
        {sellerItems.length === 0 ? (
          <div className="w-full text-center py-20 border border-dashed border-[#cacacb] bg-[#f5f5f5]">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#9e9ea0] mb-3" />
            <p className="text-sm font-bold text-[#111111] uppercase tracking-wide">Belum ada barang</p>
            <p className="text-xs text-[#707072] mt-1">
              Toko ini belum mengunggah barang dagangan, atau pencarian Anda tidak cocok.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellerItems.map((item) => (
              <Link
                key={item.id}
                href={`/${item.sellerUsername}/${item.id}`}
                className="group flex flex-col h-full bg-white border border-[#e5e5e5] hover:border-black transition-all relative"
              >
                {/* Product Image Stage */}
                <div className="w-full aspect-square bg-[#f5f5f5] overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlays */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="bg-white border border-[#cacacb] text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.condition.split(" ")[0]}
                    </span>
                  </div>

                  {item.isSold && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <span className="bg-white border-2 border-black text-black font-display text-lg tracking-widest uppercase px-6 py-2 rotate-[-5deg] select-none">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  {/* Marketplace availability tags */}
                  <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                    {item.shopeeUrl && (
                      <span className="w-5 h-5 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center font-bold text-[8px]">
                        S
                      </span>
                    )}
                    {item.tokopediaUrl && (
                      <span className="w-5 h-5 rounded-full bg-[#03AC0E] text-white flex items-center justify-center font-bold text-[8px]">
                        T
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xs font-bold text-[#111111] leading-tight break-words line-clamp-2 min-h-8">
                    {item.name}
                  </h3>
                  <span className="text-[10px] text-[#707072] font-semibold mt-1 block">
                    {item.category}
                  </span>

                  <div className="mt-auto pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
                    <span className={`text-xs font-bold ${item.isSold ? "text-[#707072] line-through" : "text-[#111111]"}`}>
                      {formatIDR(item.price)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#007d48]">
                      Fixed Price
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
