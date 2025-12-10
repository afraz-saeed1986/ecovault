// components/WishlistProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { EnhancedProduct, WishlistContextType } from "@/types";
import { productService } from "@/services/product.service";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<EnhancedProduct[]>([]);

  // لود اولیه — از localStorage فقط idها رو بگیر و دوباره محصول کامل رو از سرویس بکش
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const saved = localStorage.getItem("ecovault-wishlist");

        if (!saved) {
          setWishlist([]);
          return;
        }

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = parsed
            .filter(
              (item): item is { id: number } =>
                item && typeof item.id === "number"
            )
            .map((item) => item.id);

          if (ids.length === 0) {
            setWishlist([]);
            return;
          }

          // دوباره محصولات کامل رو از سرویس بگیر (تا فیلدهای محاسباتی مثل avgRating و mainImage داشته باشن)
          const result = await productService.getAll({ limit: 500 });
          const fullProducts = result.products.filter((p) =>
            ids.includes(p.id!)
          );

          setWishlist(fullProducts);
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setWishlist([]);
      }
    };

    loadWishlist();
  }, []);

  // ذخیره فقط idها (بهینه و امن)
  useEffect(() => {
    const idsToSave = wishlist.map((p) => ({ id: p.id }));
    try {
      localStorage.setItem("ecovault-wishlist", JSON.stringify(idsToSave));
    } catch (err) {
      console.error("Failed to save wishlist:", err);
    }
  }, [wishlist]);

  const toggleWishlist = (product: EnhancedProduct) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id));
  };

  const isInWishlist = (id: number) => wishlist.some((p) => p.id === id);

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
