"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKala, PrelovedItem, Category, Condition } from "@/app/context/KalaContext";
import {
  TrendingUp,
  Package,
  Archive,
  MousePointerClick,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  X,
  FileText,
  AlertCircle,
  Globe,
  Upload
} from "lucide-react";

export default function SellerDashboardPage() {
  const { currentUser, items, clicksLog, addItem, updateItem, deleteItem } = useKala();
  const router = useRouter();

  // Onboarding guard: Redirect if user not logged in
  useEffect(() => {
    // If user is not logged in after first render, we show a clean sign-in screen on dashboard
  }, [currentUser]);

  // Chart time range toggle: 7 Days, 30 Days, All-Time
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "all">("7days");

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PrelovedItem | null>(null);

  // Form Fields
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<Category>("Fashion & Accessories");
  const [itemCondition, setItemCondition] = useState<Condition>("9/10 Excellent");
  const [itemPriceRaw, setItemPriceRaw] = useState(""); // Raw text for typing numbers
  const [itemPriceFormatted, setItemPriceFormatted] = useState("Rp 0");
  const [itemDescription, setItemDescription] = useState("");
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [tokopediaUrl, setTokopediaUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  // Categories & Conditions lists
  const CATEGORIES: Category[] = [
    "Fashion & Accessories",
    "Electronics & Gadgets",
    "Books & Literature",
    "Home & Living",
    "Hobbies & Collectibles",
    "Others",
  ];

  const CONDITIONS: Condition[] = [
    "10/10 Like New",
    "9/10 Excellent",
    "8/10 Good Condition",
    "7/10 Well Used",
  ];

  // REAL-TIME CURRENCY INPUT MASK (PRD Section 3.3.2 - fixed price formatting)
  const handlePriceChange = (val: string) => {
    // Remove non-digits
    const digitsOnly = val.replace(/\D/g, "");
    
    setItemPriceRaw(digitsOnly);

    if (digitsOnly === "") {
      setItemPriceFormatted("Rp 0");
      return;
    }

    const parsedNum = parseInt(digitsOnly);
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parsedNum);

    // clean up formatted string formatting issues if any
    setItemPriceFormatted(formatted);
  };

  // Mock Upload Image via URL or local file reader (DataURL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 4) {
      setFormError("Maksimal unggah 4 foto barang.");
      return;
    }

    setFormError("");

    Array.from(files).forEach((file) => {
      // Size limits (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Ukuran file tidak boleh melebihi 5MB.");
        return;
      }

      // Type checks
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setFormError("Format file tidak valid (Gunakan JPEG, PNG, atau WEBP).");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Clear Form
  const resetForm = () => {
    setItemName("");
    setItemCategory("Fashion & Accessories");
    setItemCondition("9/10 Excellent");
    setItemPriceRaw("");
    setItemPriceFormatted("Rp 0");
    setItemDescription("");
    setShopeeUrl("");
    setTokopediaUrl("");
    setUploadedImages([]);
    setFormError("");
    setEditingItem(null);
  };

  // Open form for editing
  const openEditForm = (item: PrelovedItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemCondition(item.condition);
    setItemPriceRaw(item.price.toString());
    
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(item.price);
    setItemPriceFormatted(formatted);

    setItemDescription(item.description);
    setShopeeUrl(item.shopeeUrl || "");
    setTokopediaUrl(item.tokopediaUrl || "");
    setUploadedImages(item.imageUrls || []);
    setIsFormOpen(true);
  };

  // Save Form Handler
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // VALIDATIONS (PRD 3.3.2)
    if (itemName.trim().length < 5 || itemName.trim().length > 80) {
      setFormError("Nama barang harus berukuran 5 - 80 karakter.");
      return;
    }

    if (!itemPriceRaw || parseInt(itemPriceRaw) <= 0) {
      setFormError("Harga barang harus valid dan lebih besar dari Rp 0.");
      return;
    }

    if (itemDescription.trim().length === 0 || itemDescription.trim().length > 1000) {
      setFormError("Deskripsi barang harus diisi (maksimal 1000 karakter).");
      return;
    }

    // URL validation
    const shopeeRegex = /shopee\.co\.id\/.+/i;
    const tokopediaRegex = /tokopedia\.com\/.+/i;

    const shopeeValid = shopeeUrl.trim() ? shopeeRegex.test(shopeeUrl.trim()) : false;
    const tokopediaValid = tokopediaUrl.trim() ? tokopediaRegex.test(tokopediaUrl.trim()) : false;

    if (shopeeUrl.trim() && !shopeeValid) {
      setFormError("Format Link Shopee tidak valid (harus mengandung shopee.co.id/).");
      return;
    }

    if (tokopediaUrl.trim() && !tokopediaValid) {
      setFormError("Format Link Tokopedia tidak valid (harus mengandung tokopedia.com/).");
      return;
    }

    if (!shopeeUrl.trim() && !tokopediaUrl.trim()) {
      setFormError("Wajib menyertakan minimal 1 link marketplace (Shopee atau Tokopedia).");
      return;
    }

    if (uploadedImages.length === 0) {
      // Seed a default photo if none uploaded to make page look beautiful
      uploadedImages.push("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80");
    }

    const priceNum = parseInt(itemPriceRaw);

    if (editingItem) {
      // Edit
      updateItem(editingItem.id, {
        name: itemName,
        category: itemCategory,
        condition: itemCondition,
        price: priceNum,
        description: itemDescription,
        shopeeUrl: shopeeUrl.trim() || null,
        tokopediaUrl: tokopediaUrl.trim() || null,
        imageUrls: uploadedImages,
      });
    } else {
      // Add
      addItem({
        name: itemName,
        category: itemCategory,
        condition: itemCondition,
        price: priceNum,
        description: itemDescription,
        shopeeUrl: shopeeUrl.trim() || null,
        tokopediaUrl: tokopediaUrl.trim() || null,
        imageUrls: uploadedImages,
      });
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Filter items/analytics data for current seller
  const sellerItems = items.filter(
    (item) => item.sellerUsername === currentUser?.username
  );

  const activeListingsCount = sellerItems.filter((item) => !item.isSold && !item.isArchived).length;
  const soldOrArchivedCount = sellerItems.filter((item) => item.isSold || item.isArchived).length;
  const totalClicksCount = sellerItems.reduce((acc, curr) => acc + (curr.clicksCount || 0), 0);

  // Click Logs filtered for this seller
  const sellerItemIds = sellerItems.map((i) => i.id);
  const sellerClickLogs = clicksLog.filter((log) => sellerItemIds.includes(log.itemId));

  // Product Click Table sorting: Highest to Lowest
  const sortedProductsByClicks = [...sellerItems].sort((a, b) => b.clicksCount - a.clicksCount);

  // Build daily click values for custom SVG chart
  const getChartData = () => {
    const daysToCount = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const chartLabels: string[] = [];
    const chartValues: number[] = [];

    for (let i = daysToCount - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateString = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      chartLabels.push(dateString);

      // Count clicks on this date string
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      const clicksOnDay = sellerClickLogs.filter((log) => {
        const timestamp = new Date(log.timestamp).getTime();
        return timestamp >= startOfDay && timestamp < endOfDay;
      }).length;

      chartValues.push(clicksOnDay);
    }

    return { labels: chartLabels, values: chartValues };
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.values, 5); // Fallback to 5 to avoid flat chart

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // If not logged in, show clean Login request
  if (!currentUser) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-32 bg-[#f5f5f5] px-4">
          <div className="text-center max-w-md bg-white border border-[#cacacb] p-10">
            <Package className="w-14 h-14 mx-auto text-[#111111] mb-6" />
            <h2 className="text-xl font-bold text-[#111111] uppercase tracking-wider mb-3">Akses Halaman Terbatas</h2>
            <p className="text-xs text-[#707072] mt-2 mb-8 leading-relaxed">
              Silakan masuk atau buat akun baru di Kala Hub terlebih dahulu untuk membuka Private Seller Dashboard Anda.
            </p>
            <button
              onClick={() => {
                // Trigger the auth modal by forcing an action event or simulating
                const event = new CustomEvent("open-auth-modal");
                window.dispatchEvent(event);
                
                // Let's print instructions or use our login trigger from header
                // Note that header auth triggers on the same page.
                // We'll let the user click "Masuk" in the top bar.
              }}
              className="w-full bg-[#111111] text-white font-bold text-xs h-11 rounded-full hover:bg-black transition-all uppercase tracking-wider"
            >
              Gunakan Menu "Masuk" Di Atas
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 md:py-16">
        
        {/* Dashboard Title Onboarding Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e5e5e5] pb-8 mb-12">
          <div>
            <span className="text-[10px] font-bold text-[#707072] uppercase tracking-widest">Workspace Penjual</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] uppercase tracking-wide mt-1">
              DASHBOARD @{currentUser.username}
            </h1>
            <p className="text-xs text-[#707072] font-semibold mt-1">
              Pantau klik outbound, status inventaris, dan kelola listing preloved Anda.
            </p>
          </div>

          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-[#007d48] text-white hover:bg-[#00653a] font-bold text-xs h-11 px-6 rounded-full transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item Preloved Baru</span>
          </button>
        </section>

        {/* METRIC CARDS ROW (PRD Section 3.2.2 Metric Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-[#f5f5f5] border border-[#cacacb] p-6 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#707072] uppercase tracking-widest">Listing Aktif</span>
              <p className="font-display text-4xl tracking-tight text-[#111111] mt-2">{activeListingsCount}</p>
              <span className="text-[10px] text-[#707072] font-semibold mt-1 block">Tampil di marketplace umum</span>
            </div>
            <Package className="w-5 h-5 text-[#111111]" />
          </div>

          {/* Card 2 */}
          <div className="bg-[#f5f5f5] border border-[#cacacb] p-6 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#707072] uppercase tracking-widest">Terjual / Arsip</span>
              <p className="font-display text-4xl tracking-tight text-[#111111] mt-2">{soldOrArchivedCount}</p>
              <span className="text-[10px] text-[#707072] font-semibold mt-1 block">Dikeluarkan dari rotasi pencarian</span>
            </div>
            <Archive className="w-5 h-5 text-[#111111]" />
          </div>

          {/* Card 3 */}
          <div className="bg-[#f5f5f5] border border-[#cacacb] p-6 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#707072] uppercase tracking-widest">Marketplace Redirects</span>
              <p className="font-display text-4xl tracking-tight text-[#111111] mt-2">{totalClicksCount}</p>
              <span className="text-[10px] text-[#007d48] font-bold mt-1 block">Klik outbound total pembeli</span>
            </div>
            <MousePointerClick className="w-5 h-5 text-[#007d48]" />
          </div>
        </section>

        {/* ANALYTICS GRAPH ROW (PRD Section 3.2.2 Analytics Line/Bar Chart) */}
        <section className="bg-white border border-[#cacacb] p-6 md:p-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-6 mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#111111]" />
              <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-[#111111]">
                Tren Klik Outbound Marketplace
              </h2>
            </div>
            
            {/* Chart range toggles */}
            <div className="flex items-center bg-[#f5f5f5] rounded-full p-1 border border-[#cacacb]">
              <button
                onClick={() => setTimeRange("7days")}
                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all ${
                  timeRange === "7days" ? "bg-[#111111] text-white" : "text-[#707072] hover:text-black"
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setTimeRange("30days")}
                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all ${
                  timeRange === "30days" ? "bg-[#111111] text-white" : "text-[#707072] hover:text-black"
                }`}
              >
                30 Hari
              </button>
              <button
                onClick={() => setTimeRange("all")}
                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all ${
                  timeRange === "all" ? "bg-[#111111] text-white" : "text-[#707072] hover:text-black"
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          {/* Premium Custom SVG Bar Chart (Geometric, Minimal, Nike styling) */}
          <div className="w-full bg-[#f5f5f5] p-6 border border-[#e5e5e5]">
            <div className="h-[220px] w-full flex items-end justify-between gap-1 sm:gap-2">
              {chartData.values.map((val, idx) => {
                const heightPercent = (val / maxChartValue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-[#111111] text-white text-[9px] font-semibold px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-10 whitespace-nowrap">
                      {val} Klik
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${Math.max(heightPercent, 2)}%` }} 
                      className={`w-full max-w-[24px] transition-all duration-500 rounded-t-sm ${
                        val > 0 ? "bg-[#111111] group-hover:bg-[#007d48]" : "bg-[#cacacb]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Label Row */}
            <div className="flex justify-between mt-3 text-[9px] font-bold text-[#707072] uppercase tracking-wider pt-2 border-t border-[#e5e5e5]">
              <span>{chartData.labels[0]}</span>
              <span>{chartData.labels[Math.floor(chartData.labels.length / 2)]}</span>
              <span>{chartData.labels[chartData.labels.length - 1]}</span>
            </div>
          </div>
        </section>

        {/* LISTINGS & ACTIVITY LOG TABLE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Listings Inventory Management (8/12 grid width) */}
          <div className="lg:col-span-8 bg-white border border-[#cacacb] p-6 md:p-8">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-[#111111] border-b border-[#e5e5e5] pb-4 mb-6">
              Manajemen Inventaris Barang
            </h3>

            {sellerItems.length === 0 ? (
              <div className="text-center py-16 bg-[#f5f5f5] border border-dashed border-[#cacacb]">
                <Package className="w-8 h-8 text-[#9e9ea0] mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#111111]">Belum Ada Listing</p>
                <p className="text-[10px] text-[#707072] mt-0.5 mb-5">
                  Tambahkan barang preloved pertama Anda untuk memulai promosi digital.
                </p>
                <button
                  onClick={() => { resetForm(); setIsFormOpen(true); }}
                  className="bg-black text-white font-bold text-xs h-9 px-5 rounded-full hover:bg-zinc-800 transition-all"
                >
                  Tambah Barang Baru
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sellerItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#e5e5e5] p-4 bg-[#f5f5f5] gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-white border border-[#cacacb] overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#111111] truncate max-w-[200px] sm:max-w-md">
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] font-semibold bg-white border border-[#cacacb] text-black px-1.5 py-0.5 rounded-sm">
                            {formatIDR(item.price)}
                          </span>
                          {item.isSold ? (
                            <span className="bg-[#d30005]/10 text-[#d30005] border border-[#d30005]/20 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                              Sold Out
                            </span>
                          ) : item.isArchived ? (
                            <span className="bg-zinc-200 text-zinc-600 border border-zinc-300 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                              Archived
                            </span>
                          ) : (
                            <span className="bg-[#007d48]/10 text-[#007d48] border border-[#007d48]/20 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Listing Action buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link
                        href={`/${item.sellerUsername}/${item.id}`}
                        className="p-1.5 bg-white border border-[#cacacb] hover:bg-[#f5f5f5] text-black rounded-none"
                        title="Lihat Halaman Produk"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEditForm(item)}
                        className="text-xs font-bold bg-white border border-black hover:bg-[#f5f5f5] px-3.5 py-1.5 rounded-none"
                      >
                        Edit
                      </button>
                      
                      {!item.isSold && (
                        <button
                          onClick={() => updateItem(item.id, { isSold: true })}
                          className="text-xs font-bold bg-[#007d48] hover:bg-[#00653a] text-white px-3.5 py-1.5 rounded-none"
                        >
                          Sold Out
                        </button>
                      )}

                      {item.isSold && (
                        <button
                          onClick={() => updateItem(item.id, { isSold: false })}
                          className="text-xs font-bold bg-white border border-[#cacacb] hover:bg-[#f5f5f5] text-[#707072] px-3.5 py-1.5 rounded-none"
                        >
                          Re-list
                        </button>
                      )}

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 bg-[#fdf2f2] text-[#d30005] border border-[#fde8e8] hover:bg-[#fde8e8] rounded-none"
                        title="Hapus Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Block: Clicks Activity List Table (4/12 grid width) */}
          <div className="lg:col-span-4 bg-white border border-[#cacacb] p-6 md:p-8">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-[#111111] border-b border-[#e5e5e5] pb-4 mb-6">
              Activity Clicks Rank
            </h3>

            {sortedProductsByClicks.length === 0 ? (
              <p className="text-[10px] text-[#707072] italic text-center py-8">Belum ada statistik klik terekam.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#707072] uppercase tracking-wider border-b border-[#e5e5e5] pb-2">
                  <span>Nama Barang</span>
                  <span>Clicks</span>
                </div>
                {sortedProductsByClicks.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-bold text-[#111111] truncate max-w-[200px]" title={item.name}>
                      {item.name}
                    </span>
                    <span className="font-display text-base text-[#007d48] font-bold flex-shrink-0">
                      {item.clicksCount || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Slide-over Drawer style Add / Edit Item Form Modal (DESIGN.md shapes: rounded.none inputs) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-[#cacacb] p-8 max-h-[90vh] overflow-y-auto relative flex flex-col">
            <button
              onClick={() => { setIsFormOpen(false); resetForm(); }}
              className="absolute top-4 right-4 text-xl font-light hover:text-[#707072] border border-[#cacacb] w-8 h-8 rounded-full flex items-center justify-center bg-[#f5f5f5]"
            >
              ✕
            </button>

            <div className="mb-6">
              <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-[#111111]">
                {editingItem ? "Ubah Item Preloved" : "Tambah Item Preloved Baru"}
              </h3>
              <p className="text-xs text-[#707072] mt-1 font-semibold">
                Lengkapi spesifikasi produk Anda. Bidding dinonaktifkan secara otomatis.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-[#fdf2f2] text-[#d30005] border border-[#fde8e8] text-xs font-semibold mb-6 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Form Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-name" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                    Nama Barang
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Contoh: Nike Blazer Mid '77 Vintage (Size 43)"
                    className="w-full h-10 px-3 border border-[#cacacb] text-xs focus:outline-none focus:border-black rounded-none"
                  />
                  <span className="text-[9px] text-[#707072]">Minimal 5 karakter, maksimal 80 karakter.</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="form-category" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                      Kategori
                    </label>
                    <select
                      id="form-category"
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value as Category)}
                      className="w-full h-10 px-2 border border-[#cacacb] text-xs bg-white focus:outline-none focus:border-black rounded-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="form-condition" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                      Kondisi
                    </label>
                    <select
                      id="form-condition"
                      value={itemCondition}
                      onChange={(e) => setItemCondition(e.target.value as Condition)}
                      className="w-full h-10 px-2 border border-[#cacacb] text-xs bg-white focus:outline-none focus:border-black rounded-none"
                    >
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* REAL-TIME MASKED CURRENCY FIELD */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-price" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                    Harga Mati (Fixed Price - IDR)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-[#707072] text-xs font-semibold">Rp</span>
                    <input
                      id="form-price"
                      type="text"
                      required
                      value={itemPriceRaw}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="500000"
                      className="w-full h-10 pl-9 pr-3 border border-[#cacacb] text-xs font-bold text-black focus:outline-none focus:border-black rounded-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#707072] mt-0.5">
                    <span>Tampilan Format: <strong className="text-black">{itemPriceFormatted}</strong></span>
                    <span className="text-[#007d48]">Fixed Price System</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-desc" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                    Deskripsi Barang
                  </label>
                  <textarea
                    id="form-desc"
                    required
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    rows={4}
                    placeholder="Sebutkan detail minus, kelengkapan box, kecacatan produk jika ada secara transparan..."
                    className="w-full p-3 border border-[#cacacb] text-xs focus:outline-none focus:border-black rounded-none resize-none"
                    maxLength={1000}
                  />
                  <span className="text-[9px] text-[#707072] text-right">
                    {itemDescription.length}/1000 karakter
                  </span>
                </div>
              </div>

              {/* Right Form Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-shopee" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                    Tautan Shopee Indonesia
                  </label>
                  <input
                    id="form-shopee"
                    type="text"
                    value={shopeeUrl}
                    onChange={(e) => setShopeeUrl(e.target.value)}
                    placeholder="Contoh: shopee.co.id/Nama-Toko-i.123.456"
                    className="w-full h-10 px-3 border border-[#cacacb] text-xs focus:outline-none focus:border-black rounded-none"
                  />
                  <span className="text-[9px] text-[#707072]">Tautan checkout Shopee barang yang sama.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-tokopedia" className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                    Tautan Tokopedia
                  </label>
                  <input
                    id="form-tokopedia"
                    type="text"
                    value={tokopediaUrl}
                    onChange={(e) => setTokopediaUrl(e.target.value)}
                    placeholder="Contoh: tokopedia.com/nama-toko/nama-barang"
                    className="w-full h-10 px-3 border border-[#cacacb] text-xs focus:outline-none focus:border-black rounded-none"
                  />
                  <span className="text-[9px] text-[#707072]">Tautan checkout Tokopedia barang yang sama.</span>
                </div>

                {/* Image upload selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block">
                    Foto Barang (Maksimal 4)
                  </span>
                  
                  <label className="border border-dashed border-[#cacacb] bg-[#f5f5f5] hover:bg-zinc-100 cursor-pointer h-24 flex flex-col items-center justify-center gap-1.5 text-center px-4 transition-all">
                    <Upload className="w-5 h-5 text-[#707072]" />
                    <span className="text-[10px] font-bold text-[#111111] uppercase">Pilih File Foto</span>
                    <span className="text-[8px] text-[#707072]">JPEG, PNG, WEBP (Maksimal 5MB)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded images previews grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-zinc-100 border border-[#cacacb] relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -right-1.5 bg-[#d30005] text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold hover:bg-[#780700]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-6 border-t border-[#e5e5e5] mt-4">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); resetForm(); }}
                  className="bg-[#f5f5f5] hover:bg-[#cacacb] text-black font-bold text-xs h-11 px-6 rounded-full transition-all uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#111111] hover:bg-black text-white font-bold text-xs h-11 px-8 rounded-full transition-all uppercase tracking-wider"
                >
                  {editingItem ? "Ubah Listing" : "Simpan & Publikasikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
