"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, User, LogOut, LayoutDashboard, Plus, Store, Check } from "lucide-react";
import { useKala } from "@/app/context/KalaContext";
import { useClerk } from "@clerk/nextjs";

interface HeaderProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

function HeaderInner({ onSearchChange, searchValue = "" }: HeaderProps) {
  const { currentUser, login, loginWithGoogle, logout, register, claimUsername } = useKala();
  const { openSignIn, openSignUp } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search input state
  const [searchVal, setSearchVal] = useState(searchValue);
  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "username">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Dropdown menu state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setSearchVal(searchValue);
  }, [searchValue]);

  // Sync search query from URL search parameters
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchVal(query);
    }
  }, [searchParams]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
    } else {
      router.push(`/?search=${encodeURIComponent(searchVal)}`);
    }
  };

  // Open modal and check onboarding status
  useEffect(() => {
    if (currentUser && currentUser.username === null) {
      setAuthMode("username");
      setIsAuthOpen(true);
    }
  }, [currentUser]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (authMode === "login") {
      if (!email) {
        setAuthError("Email harus diisi");
        return;
      }
      const success = await login(email);
      if (success) {
        setIsAuthOpen(false);
        setEmail("");
      } else {
        setAuthError("Email tidak terdaftar. Coba 'siti@fashion.com' atau daftar baru.");
      }
    } else if (authMode === "register") {
      if (!email || !name) {
        setAuthError("Nama dan Email harus diisi");
        return;
      }
      const success = await register(email, name);
      if (success) {
        setAuthMode("username");
      } else {
        setAuthError("Email sudah terdaftar.");
      }
    } else if (authMode === "username") {
      // Username validation
      const cleanUsername = usernameInput.trim().toLowerCase();
      const isValid = /^[a-z0-9_-]+$/.test(cleanUsername);
      
      if (!isValid) {
        setAuthError("Username hanya boleh huruf kecil, angka, - dan _");
        return;
      }
      
      const success = await claimUsername(cleanUsername);
      if (success) {
        setIsAuthOpen(false);
        setUsernameInput("");
        router.push("/dashboard");
      } else {
        setAuthError("Username sudah terpakai. Coba yang lain.");
      }
    }
  };

  const triggerGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#e5e5e5]">
        {/* Secondary top bar containing brand claim and fast login helpers */}
        <div className="hidden sm:flex bg-[#f5f5f5] text-[#111111] text-[12px] font-medium h-9 px-6 items-center justify-between">
          <span>Fixed price, no bargaining. Clean preloved storefronts.</span>
          <div className="flex items-center gap-4">
            <span className="text-[#707072] cursor-pointer hover:text-black">Bantuan</span>
            <span className="text-[#707072]">|</span>
            {currentUser ? (
              <span className="text-[#111111] font-semibold">Halo, {currentUser.name}</span>
            ) : (
              <span 
                onClick={() => openSignIn()}
                className="text-[#707072] cursor-pointer hover:text-black"
              >
                Gabung Kala Hub
              </span>
            )}
          </div>
        </div>

        {/* Primary Navigation Header */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-tighter text-[#111111]">KALA.</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 sm:mx-8">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-3 flex items-center justify-center text-[#707072]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Cari brand, barang preloved, atau seller..."
                className="w-full h-10 pl-10 pr-4 bg-[#f5f5f5] text-[#111111] text-sm rounded-2xl border-none outline-none focus:bg-white focus:ring-2 focus:ring-[#111111] transition-all"
              />
            </div>
          </form>

          {/* Action Hub */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center justify-center gap-2 bg-[#007d48] text-white font-medium text-sm h-10 px-5 rounded-full hover:bg-[#00653a] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jual Barang</span>
                </Link>
                
                {/* User avatar and dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 outline-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#cacacb]"
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#cacacb] rounded-none shadow-none z-50 text-left py-2">
                      <div className="px-4 py-2 border-b border-[#e5e5e5]">
                        <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                        <p className="text-xs text-[#707072] truncate">@{currentUser.username || "belum_set"}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[#111111] hover:bg-[#f5f5f5] transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#707072]" />
                        <span>Dashboard Saya</span>
                      </Link>
                      <Link
                        href="/dashboard?editProfile=true"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[#111111] hover:bg-[#f5f5f5] transition-all"
                      >
                        <User className="w-4 h-4 text-[#707072]" />
                        <span>Edit Profil</span>
                      </Link>
                      {currentUser.username && (
                        <Link
                          href={`/${currentUser.username}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[#111111] hover:bg-[#f5f5f5] transition-all"
                        >
                          <Store className="w-4 h-4 text-[#707072]" />
                          <span>Toko Publik Saya</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-[#d30005] hover:bg-[#f5f5f5] transition-all"
                      >
                        <LogOut className="w-4 h-4 text-[#d30005]" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openSignIn()}
                  className="font-medium text-sm text-[#111111] px-3 py-2 hover:underline decoration-1"
                >
                  Masuk
                </button>
                <button
                  onClick={() => openSignUp()}
                  className="bg-[#111111] text-white font-medium text-sm h-10 px-5 rounded-full hover:bg-black transition-all"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modern Authentication Drawer Overlay */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#cacacb] p-8 relative flex flex-col">
            {/* Show Close button only if username is not null */}
            {(!currentUser || currentUser.username !== null) && (
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 text-xl font-light hover:text-[#707072]"
              >
                ✕
              </button>
            )}

            <div className="text-center mb-6">
              <span className="font-display text-3xl tracking-tighter text-[#111111] block mb-2">KALA.</span>
              <h3 className="text-lg font-bold text-[#111111]">
                {authMode === "login" && "Masuk ke Akun Anda"}
                {authMode === "register" && "Buat Akun Baru"}
                {authMode === "username" && "Klaim Handle Toko Anda"}
              </h3>
              <p className="text-sm text-[#707072] mt-1">
                {authMode === "login" && "Masukkan email terdaftar untuk mengelola katalog Anda"}
                {authMode === "register" && "Mulailah membuat katalog preloved premium Anda sendiri"}
                {authMode === "username" && "Ini akan menjadi URL toko publik Anda (misalnya kala.id/@username)"}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-[#fdf2f2] text-[#d30005] border border-[#fde8e8] text-xs font-semibold mb-4 rounded-none">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthAction} className="flex flex-col gap-4">
              {authMode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="auth-name" className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Siti Rahma"
                    className="w-full h-11 px-4 border border-[#cacacb] text-sm focus:outline-none focus:border-[#111111] rounded-none"
                  />
                </div>
              )}

              {authMode !== "username" ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="auth-email" className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                    Alamat Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: nama@domain.com"
                    className="w-full h-11 px-4 border border-[#cacacb] text-sm focus:outline-none focus:border-[#111111] rounded-none"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="auth-username" className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                    Pilih Username Handle
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#707072] text-sm font-semibold">kala.id/</span>
                    <input
                      id="auth-username"
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                      placeholder="siti_thrift"
                      className="w-full h-11 pl-[64px] pr-4 border border-[#cacacb] text-sm focus:outline-none focus:border-[#111111] rounded-none font-semibold text-black"
                    />
                  </div>
                  <span className="text-[10px] text-[#707072] mt-0.5">
                    Hanya gunakan huruf kecil, angka, tanda hubung (-) atau underscore (_)
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#111111] text-white font-medium text-sm h-11 rounded-full hover:bg-black mt-2 transition-all flex items-center justify-center"
              >
                {authMode === "login" && "Masuk Sekarang"}
                {authMode === "register" && "Daftar Akun"}
                {authMode === "username" && "Klaim Handle & Selesai"}
              </button>
            </form>

            {authMode !== "username" && (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <span className="absolute w-full border-t border-[#e5e5e5]" />
                  <span className="relative bg-white px-3 text-xs font-semibold text-[#707072] uppercase tracking-wider">
                    Atau masuk dengan
                  </span>
                </div>

                <button
                  type="button"
                  onClick={triggerGoogleLogin}
                  className="w-full border border-[#cacacb] text-[#111111] font-semibold text-sm h-11 rounded-full hover:bg-[#f5f5f5] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google Account</span>
                </button>

                <div className="text-center mt-6 text-sm text-[#707072]">
                  {authMode === "login" ? (
                    <>
                      Belum punya akun?{" "}
                      <button
                        onClick={() => setAuthMode("register")}
                        className="text-[#111111] font-semibold underline underline-offset-2"
                      >
                        Daftar di sini
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        onClick={() => setAuthMode("login")}
                        className="text-[#111111] font-semibold underline underline-offset-2"
                      >
                        Masuk di sini
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Fallback skeleton header loader
function HeaderPlaceholder({ searchValue = "" }: { searchValue?: string }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#e5e5e5]">
      <div className="hidden sm:flex bg-[#f5f5f5] text-[#707072] text-[12px] font-medium h-9 px-6 items-center justify-between">
        <span>Fixed price, no bargaining. Clean preloved storefronts.</span>
        <span>Memuat...</span>
      </div>
      <div className="flex items-center justify-between h-16 px-4 sm:px-8">
        <span className="font-display text-2xl tracking-tighter text-[#111111]">KALA.</span>
        <div className="flex-1 max-w-md mx-4 sm:mx-8">
          <input
            type="text"
            readOnly
            value={searchValue}
            placeholder="Cari brand, barang preloved, atau seller..."
            className="w-full h-10 pl-10 pr-4 bg-[#f5f5f5] text-[#111111] text-sm rounded-2xl border-none outline-none"
          />
        </div>
        <div className="w-16 h-8 bg-[#f5f5f5] rounded-full animate-pulse" />
      </div>
    </header>
  );
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <Suspense fallback={<HeaderPlaceholder searchValue={props.searchValue} />}>
      <HeaderInner {...props} />
    </Suspense>
  );
};
