"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#cacacb] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans font-bold text-sm text-[#111111] uppercase tracking-wider">Sumber Daya</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Mulai Jual
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Panduan Foto Produk
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Tips Keamanan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Kala Hub Pro
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans font-bold text-sm text-[#111111] uppercase tracking-wider">Bantuan</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Hubungi Dukungan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Kebijakan Barang Terlarang
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Masalah Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans font-bold text-sm text-[#111111] uppercase tracking-wider">Perusahaan</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Tentang KALA
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Press & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans font-bold text-sm text-[#111111] uppercase tracking-wider">Komunitas & Diskon</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Grup Komunitas Seller
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Event Decluttering Lokal
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs font-semibold text-[#707072] hover:text-[#111111]">
                  Promo Rekomendasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-[#cacacb]" />

        {/* Fine Print Footer Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
          <div className="flex flex-wrap items-center gap-4 text-[9px] font-semibold text-[#707072] uppercase tracking-widest">
            <span>© {new Date().getFullYear()} KALA PRELOVED HUB. HAK CIPTA DILINDUNGI.</span>
            <span className="hidden md:inline">•</span>
            <Link href="#" className="hover:text-black">KETENTUAN LAYANAN</Link>
            <span className="hidden md:inline">•</span>
            <Link href="#" className="hover:text-black">KEBIJAKAN PRIVASI</Link>
            <span className="hidden md:inline">•</span>
            <Link href="#" className="hover:text-black">PEDOMAN KOMUNITAS</Link>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#707072] uppercase tracking-widest">
            <span>Indonesia (IDR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
