"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, CartContextType } from "@/types"; 




const STORAGE_KEY = "ecovault-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}:{children: ReactNode}){
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
    });


    //save in localstorage
   useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Saving cart failed:", e);
    }
  }, [cart]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if(existing){
                return prev.map(item => (
                    item.id === product.id
                     ? {...item, quantity: item.quantity +1}
                     : item
                ));
            }

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity:1,
                    image: product.images[0]
                }
            ]
        })
    };


    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if(quantity <= 0 ){
            removeFromCart(id);
            return;
        }

        setCart(prev => (
            prev.map(item => (item.id === id ? {...item, quantity} : item))
        ));
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity ,0);
    const totalPrice = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if(!context) throw new Error("useCart must be used within CartProvider");
    return context;
};