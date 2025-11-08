"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useLayoutEffect } from "react";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}:{children: ReactNode}){
    const [cart, setCart] = useState<CartItem[]>([]);

    //load from localstorage
        useLayoutEffect(() => {
            const saved = localStorage.getItem("ecovault-cart");
            if(saved){
                try{
                    const data = JSON.parse(saved);
                    requestAnimationFrame(() => {
                        setCart(data);
                    });
                } catch (e) {
                    console.error("Failed to parse cart from localStorage", e);
                }
            }
        }, []);

    //save in localstorage
    useEffect(() => {
        localStorage.setItem("ecovault-cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: any) => {
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