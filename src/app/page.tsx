"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKala, PrelovedItem, Category, Condition } from "@/app/context/KalaContext";
import { ArrowRight, SlidersHorizontal, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";

function HomeContent() {
  const { items } = useKala();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [shopeeOnly, setShopeeOnly] = useState(false);
  const [tokopediaOnly, setTokopediaOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync search query from URL search parameters (for redirects from other pages)
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Utility to format IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Filter lists constants
  const CATEGORIES: Category[] = [
    "Fashion & Accessories",
    "Electronics & Gadgets",
    "Books & Literature",
    "Home & Living",
    "Hobbies & Collectibles",
    "Others",
  ];

  const CONDITIONS = [
    { label: "10/10 Like New", value: "10/10 Like New" },
    { label: "9/10 Excellent", value: "9/10 Excellent" },
    { label: "8/10 Good", value: "8/10 Good Condition" },
    { label: "7/10 Well Used", value: "7/10 Well Used" },
  ];

  // Handle Category click
  const handleCategoryToggle = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Handle Condition click
  const handleConditionToggle = (condVal: string) => {
    if (selectedConditions.includes(condVal)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condVal));
    } else {
      setSelectedConditions([...selectedConditions, condVal]);
    }
  };

  // Clear all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice("");
    setMaxPrice("");
    setShopeeOnly(false);
    setTokopediaOnly(false);
    setSearchQuery("");
    router.replace("/");
  };

  // Filter Logic
  const filteredItems = items.filter((item) => {
    // Hide sold/archived on general marketplace
    if (item.isSold || item.isArchived) return false;

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSeller = item.sellerUsername.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSeller && !matchCat) return false;
    }

    // Category
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(item.category)) return false;
    }

    // Condition
    if (selectedConditions.length > 0) {
      if (!selectedConditions.includes(item.condition)) return false;
    }

    // Price
    if (minPrice && item.price < parseInt(minPrice)) return false;
    if (maxPrice && item.price > parseInt(maxPrice)) return false;

    // Marketplace Outbound Channel
    if (shopeeOnly && !item.shopeeUrl) return false;
    if (tokopediaOnly && !item.tokopediaUrl) return false;

    return true;
  });

  return (
    <>
      <Header searchValue={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 flex flex-col">
        {/* Full-Bleed Editorial Campaign Hero (DESIGN.md section 5.2.2 campaign-tile) */}
        <section className="relative w-full h-[560px] md:h-[680px] bg-[#111111] overflow-hidden flex items-end">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80"
              alt="Decluttering Campaign"
              className="w-full h-full object-cover opacity-50 object-center"
            />
            {/* Dark gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 flex flex-col items-start text-white">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase mb-4 text-[#cacacb]">
              Kala Hub Edisi Decluttering
            </span>
            <h1 className="font-display text-6xl sm:text-8xl md:text-9xl leading-[0.85] tracking-tight uppercase max-w-4xl text-left select-none mb-6">
              THE DIGITAL<br />GARAGE SALE
            </h1>
            <p className="text-base sm:text-lg max-w-lg text-[#cacacb] font-light leading-relaxed mb-8">
              Katalog personal premium untuk preloved hub Anda. Harga tetap, tanpa basa-basi tawar-menawar, bayar aman lewat Shopee atau Tokopedia terverifikasi.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-black font-semibold text-sm h-12 px-8 rounded-full hover:bg-[#f5f5f5] transition-all flex items-center gap-2"
              >
                <span>Mulai Buka Katalog Kala</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Catalog Search & Matrix Section */}
        <section id="catalog-section" className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-16">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-6 mb-8">
            <div>
              <h2 className="font-sans font-bold text-xl sm:text-2xl uppercase tracking-wider text-[#111111]">
                JELAJAHI BARANG PRELOVED
              </h2>
              <p className="text-xs text-[#707072] mt-1 font-semibold">
                Menampilkan {filteredItems.length} barang berkualitas terkurasi
              </p>
            </div>

            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden flex items-center gap-2 bg-[#f5f5f5] px-4 py-2 text-sm font-semibold rounded-full border border-[#cacacb]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          <div className="flex gap-8 relative">
            {/* Desktop Left Sidebar Filter Panel (DESIGN.md Section 5.2.3 filter-sidebar) */}
            <aside className="hidden md:block w-[240px] flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold uppercase tracking-wider text-[#111111]">Filter Catalog</span>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#707072] hover:text-black font-semibold underline underline-offset-2"
                >
                  Reset Semua
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-3">Kategori</h4>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2.5 text-sm text-[#39393b] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="w-4 h-4 accent-black border-[#cacacb]"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-3">Kondisi Barang</h4>
                <div className="flex flex-col gap-2">
                  {CONDITIONS.map((cond) => (
                    <label key={cond.value} className="flex items-center gap-2.5 text-sm text-[#39393b] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(cond.value)}
                        onChange={() => handleConditionToggle(cond.value)}
                        className="w-4 h-4 accent-black border-[#cacacb]"
                      />
                      <span>{cond.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-3">Rentang Harga (IDR)</h4>
                <div className="flex flex-col gap-2.5">
                  <div className="relative">
                    <span className="absolute left-3 inset-y-0 flex items-center text-[#707072] text-xs font-semibold">Rp</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full h-9 pl-9 pr-3 border border-[#cacacb] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 inset-y-0 flex items-center text-[#707072] text-xs font-semibold">Rp</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full h-9 pl-9 pr-3 border border-[#cacacb] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {/* Marketplace Source Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-3">Link Checkout</h4>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShopeeOnly(!shopeeOnly)}
                    className={`flex items-center justify-between w-full h-9 px-4 rounded-full text-xs font-semibold transition-all border ${
                      shopeeOnly
                        ? "bg-[#EE4D2D]/10 border-[#EE4D2D] text-[#EE4D2D]"
                        : "bg-[#f5f5f5] border-[#cacacb] text-[#111111]"
                    }`}
                  >
                    <span>Tersedia di Shopee</span>
                    {shopeeOnly && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setTokopediaOnly(!tokopediaOnly)}
                    className={`flex items-center justify-between w-full h-9 px-4 rounded-full text-xs font-semibold transition-all border ${
                      tokopediaOnly
                        ? "bg-[#03AC0E]/10 border-[#03AC0E] text-[#03AC0E]"
                        : "bg-[#f5f5f5] border-[#cacacb] text-[#111111]"
                    }`}
                  >
                    <span>Tersedia di Tokopedia</span>
                    {tokopediaOnly && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Filters Dropdown drawer style */}
            {showFiltersMobile && (
              <div className="absolute top-0 inset-x-0 z-20 bg-white border border-[#cacacb] p-6 md:hidden flex flex-col gap-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider">Filter Catalog</span>
                  <div className="flex gap-4">
                    <button onClick={resetFilters} className="text-xs font-semibold text-[#707072] underline">
                      Reset
                    </button>
                    <button onClick={() => setShowFiltersMobile(false)} className="text-xs font-bold text-black">
                      Tutup
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">Kategori</h4>
                    <div className="flex flex-col gap-2">
                      {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-xs text-[#39393b]">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                            className="w-3.5 h-3.5 accent-black border-[#cacacb]"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">Kondisi</h4>
                    <div className="flex flex-col gap-2">
                      {CONDITIONS.map((cond) => (
                        <label key={cond.value} className="flex items-center gap-2 text-xs text-[#39393b]">
                          <input
                            type="checkbox"
                            checked={selectedConditions.includes(cond.value)}
                            onChange={() => handleConditionToggle(cond.value)}
                            className="w-3.5 h-3.5 accent-black border-[#cacacb]"
                          />
                          <span>{cond.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Marketplace in mobile */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#e5e5e5]">
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">Harga (IDR)</h4>
                    <div className="flex flex-col gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full h-8 px-2 border border-[#cacacb] text-xs"
                      />
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full h-8 px-2 border border-[#cacacb] text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">Marketplace</h4>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setShopeeOnly(!shopeeOnly)}
                        className={`w-full text-left h-8 px-3 rounded-none text-xs font-semibold transition-all border ${
                          shopeeOnly ? "bg-[#EE4D2D]/10 border-[#EE4D2D] text-[#EE4D2D]" : "bg-[#f5f5f5] border-[#cacacb]"
                        }`}
                      >
                        Shopee Link
                      </button>
                      <button
                        onClick={() => setTokopediaOnly(!tokopediaOnly)}
                        className={`w-full text-left h-8 px-3 rounded-none text-xs font-semibold transition-all border ${
                          tokopediaOnly ? "bg-[#03AC0E]/10 border-[#03AC0E] text-[#03AC0E]" : "bg-[#f5f5f5] border-[#cacacb]"
                        }`}
                      >
                        Tokopedia Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid Panel (DESIGN.md Section 5.2.4 product-card) */}
            <div className="flex-1">
              {filteredItems.length === 0 ? (
                <div className="w-full text-center py-24 border border-dashed border-[#cacacb] bg-[#f5f5f5]">
                  <ShoppingBag className="w-12 h-12 mx-auto text-[#9e9ea0] mb-4" />
                  <p className="text-base font-semibold text-[#111111]">Tidak ada barang ditemukan</p>
                  <p className="text-xs text-[#707072] mt-1 max-w-sm mx-auto">
                    Coba sesuaikan kata kunci pencarian Anda atau hapus filter untuk melihat katalog lengkap kami.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 bg-[#111111] text-white font-semibold text-xs h-9 px-6 rounded-full hover:bg-black transition-all"
                  >
                    Atur Ulang Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {filteredItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${item.sellerUsername}/${item.id}`}
                      className="group flex flex-col h-full bg-white select-none border-none outline-none"
                    >
                      {/* Product Image Stage (flat, no shadow/border, gray stage background) */}
                      <div className="w-full aspect-square bg-[#f5f5f5] overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Left Promotion Badge */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          <span className="bg-white border border-[#cacacb] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-none">
                            {item.condition.split(" ")[0]} Condition
                          </span>
                        </div>

                        {/* Marketplace availability tags at the bottom */}
                        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
                          {item.shopeeUrl && (
                            <span className="w-6 h-6 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center font-bold text-[10px] shadow-none">
                              S
                            </span>
                          )}
                          {item.tokopediaUrl && (
                            <span className="w-6 h-6 rounded-full bg-[#03AC0E] text-white flex items-center justify-center font-bold text-[10px] shadow-none">
                              T
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Metadata Row (Nike style: direct metadata stack with 8px space) */}
                      <div className="mt-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-[#111111] leading-tight group-hover:underline decoration-1 underline-offset-2 break-words max-w-[80%]">
                            {item.name}
                          </h3>
                          <span className="text-xs font-semibold text-[#707072] whitespace-nowrap">
                            @{item.sellerUsername}
                          </span>
                        </div>
                        <span className="text-xs text-[#707072] font-semibold mt-1">
                          {item.category}
                        </span>
                        
                        <div className="mt-auto pt-3 border-t border-[#f5f5f5] flex items-center justify-between">
                          <span className="text-sm font-bold text-[#111111]">
                            {formatIDR(item.price)}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#007d48]">
                            Fixed Price
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 z-40 w-full bg-white border-b border-[#e5e5e5] h-16 flex items-center justify-between px-4 sm:px-8">
          <span className="font-display text-2xl tracking-tighter text-[#111111]">KALA.</span>
          <div className="w-16 h-8 bg-[#f5f5f5] rounded-full animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center text-xs font-bold text-[#707072] uppercase tracking-widest bg-[#f5f5f5]">
          Memuat Katalog Preloved Kala Hub...
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
