"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export type Category =
  | "Fashion & Accessories"
  | "Electronics & Gadgets"
  | "Books & Literature"
  | "Home & Living"
  | "Hobbies & Collectibles"
  | "Others";

export type Condition =
  | "10/10 Like New"
  | "9/10 Excellent"
  | "8/10 Good Condition"
  | "7/10 Well Used";

export interface PrelovedItem {
  id: string;
  name: string;
  category: Category;
  condition: Condition;
  price: number;
  description: string;
  sellerUsername: string;
  sellerName: string;
  shopeeUrl: string | null;
  tokopediaUrl: string | null;
  imageUrls: string[];
  isSold: boolean;
  isArchived: boolean;
  createdAt: string;
  clicksCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string | null; // null triggers username setup onboarding
  avatar: string;
}

export interface ClickEvent {
  id: string;
  itemId: string;
  itemName: string;
  platform: "Shopee" | "Tokopedia";
  timestamp: string;
}

interface KalaContextType {
  items: PrelovedItem[];
  sellerItems: PrelovedItem[];
  currentUser: User | null;
  users: User[];
  clicksLog: ClickEvent[];
  login: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (email: string, name: string) => Promise<boolean>;
  claimUsername: (username: string) => Promise<boolean>;
  updateProfile: (username?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  addItem: (item: Omit<PrelovedItem, "id" | "sellerUsername" | "sellerName" | "isSold" | "isArchived" | "createdAt" | "clicksCount">) => Promise<void>;
  updateItem: (id: string, updates: Partial<PrelovedItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  trackClick: (itemId: string, platform: "Shopee" | "Tokopedia") => Promise<void>;
}

const KalaContext = createContext<KalaContextType | undefined>(undefined);

// Fallback seed user profiles (for initial frontend registration mocks if API fails)
const INITIAL_USERS: User[] = [
  {
    id: "user-1",
    email: "siti@fashion.com",
    name: "Siti Rahma",
    username: "siti",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "user-2",
    email: "budi@thrift.com",
    name: "Budi Santoso",
    username: "budi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
];

export const KalaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PrelovedItem[]>([]);
  const [sellerItems, setSellerItems] = useState<PrelovedItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [clicksLog, setClicksLog] = useState<ClickEvent[]>([]);

  // Clerk authentication state
  const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();
  const { signOut: clerkSignOut, isSignedIn } = useAuth();

  // 1. Fetch items from SQLite backend API Route on startup
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items from database API:", error);
    }
  };

  // 2. Fetch Click Logs / Dashboard summaries for active seller
  const fetchSellerSummary = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/analytics/summary?sellerId=${sellerId}`);
      if (res.ok) {
        const data = await res.json();
        setClicksLog(data.clicksLog || []);
      }
    } catch (error) {
      console.error("Failed to fetch seller analytics summary:", error);
    }
  };

  // 3. Fetch all seller items (including archived ones) for dashboard use
  const fetchSellerItems = async (username: string) => {
    try {
      const res = await fetch(`/api/items?sellerUsername=${username}&includeArchived=true`);
      if (res.ok) {
        const data = await res.json();
        setSellerItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch seller items:", error);
    }
  };

  // Fetch items on start
  useEffect(() => {
    fetchItems();
  }, []);

  // Sync Clerk authentication state with our database
  useEffect(() => {
    const syncUser = async () => {
      if (clerkUserLoaded && isSignedIn && clerkUser) {
        try {
          const res = await fetch("/api/auth/sync", { method: "POST" });
          if (res.ok) {
            const dbUser = await res.json();
            setCurrentUser(dbUser);
            fetchSellerSummary(dbUser.id);
            if (dbUser.username) {
              fetchSellerItems(dbUser.username);
            }
          }
        } catch (e) {
          console.error("Clerk user sync failed:", e);
        }
      } else if (clerkUserLoaded && !isSignedIn) {
        setCurrentUser(null);
        setClicksLog([]);
        setSellerItems([]);
      }
    };

    syncUser();
  }, [clerkUser, clerkUserLoaded, isSignedIn]);

  // Legacy local auth functions made compatible with Clerk (unused but kept for API safety)
  const login = async (email: string): Promise<boolean> => {
    console.warn("Local login is deprecated. Please use Clerk.");
    return false;
  };

  const loginWithGoogle = async () => {
    console.warn("Local loginWithGoogle is deprecated. Please use Clerk.");
  };

  const logout = () => {
    clerkSignOut();
  };

  const register = async (email: string, name: string): Promise<boolean> => {
    console.warn("Local register is deprecated. Please use Clerk.");
    return false;
  };

  const claimUsername = async (username: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const res = await fetch("/api/user/claim-username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, username }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        if (updatedUser.username) {
          await fetchSellerItems(updatedUser.username);
        }
        await fetchItems();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Claim username request failed:", e);
      return false;
    }
  };

  const updateProfile = async (username?: string, avatar?: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "User tidak ditemukan" };

    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, username, avatar }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data);
        if (data.username) {
          await fetchSellerItems(data.username);
        }
        await fetchItems();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Gagal memperbarui profil" };
      }
    } catch (e) {
      console.error("Update profile request failed:", e);
      return { success: false, error: "Terjadi kesalahan pada server" };
    }
  };


  const addItem = async (itemDetails: Omit<PrelovedItem, "id" | "sellerUsername" | "sellerName" | "isSold" | "isArchived" | "createdAt" | "clicksCount">) => {
    if (!currentUser) return;

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemDetails,
          sellerId: currentUser.id,
        }),
      });

      if (res.ok) {
        await fetchItems();
        await fetchSellerSummary(currentUser.id);
        if (currentUser.username) {
          await fetchSellerItems(currentUser.username);
        }
      }
    } catch (e) {
      console.error("Add item request failed:", e);
    }
  };

  const updateItem = async (id: string, updates: Partial<PrelovedItem>) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        await fetchItems();
        if (currentUser) {
          await fetchSellerSummary(currentUser.id);
          if (currentUser.username) {
            await fetchSellerItems(currentUser.username);
          }
        }
      }
    } catch (e) {
      console.error("Update item request failed:", e);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchItems();
        if (currentUser) {
          await fetchSellerSummary(currentUser.id);
          if (currentUser.username) {
            await fetchSellerItems(currentUser.username);
          }
        }
      }
    } catch (e) {
      console.error("Delete item request failed:", e);
    }
  };

  const trackClick = async (itemId: string, platform: "Shopee" | "Tokopedia") => {
    try {
      const res = await fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, platform }),
      });

      if (res.ok) {
        // Increment clicks locally in UI state for instant rendering response
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, clicksCount: item.clicksCount + 1 } : item
          )
        );

        if (currentUser) {
          await fetchSellerSummary(currentUser.id);
          if (currentUser.username) {
            await fetchSellerItems(currentUser.username);
          }
        }
      }
    } catch (e) {
      console.error("Track click request failed:", e);
    }
  };

  return (
    <KalaContext.Provider
      value={{
        items,
        sellerItems,
        currentUser,
        users,
        clicksLog,
        login,
        loginWithGoogle,
        logout,
        register,
        claimUsername,
        updateProfile,
        addItem,
        updateItem,
        deleteItem,
        trackClick,
      }}
    >
      {children}
    </KalaContext.Provider>
  );
};

export const useKala = () => {
  const context = useContext(KalaContext);
  if (context === undefined) {
    throw new Error("useKala must be used within a KalaProvider");
  }
  return context;
};
