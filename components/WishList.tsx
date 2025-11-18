"use client";

import { createContext, useContext, useState, useEffect, ReactNode} from "react";
import { Product, WishlistContextType } from "@/types";



const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function Wishlistprovider ({children} : {children : ReactNode}) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    

    useEffect(() => {
        const saved = localStorage.getItem("ecovault-wishlist");
        if(saved) setWishlist(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("ecovault-wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product: Product) => {
        setWishlist((prev) => {
            const exist = prev.some((p) => p.id === product.id);
            if(exist) return prev.filter((p) => p.id !== product.id);
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id: number) => {
              setWishlist((prev) => {
            const exist = prev.some((p) => p.id === id);
            if(exist) return prev.filter((p) => p.id !== id);
            return [...prev];
        });
    }

    const isInWishlist = (id: number) => wishlist.some((p) => p.id === id);

    return (
        <WishlistContext.Provider value={{wishlist, toggleWishlist, isInWishlist, removeFromWishlist}}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if(!context) throw new Error("useWishlist must be used within WishlistProvider");

    return context;
}