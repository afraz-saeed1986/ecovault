"use client"

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import CartDropdown from "@/components/cartDropdown";
import { ShoppingCart, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { div, span } from "framer-motion/client";

export default function Navbar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const {totalItems} = useCart();
    const pathname = usePathname();

    const showSearch = pathname === "/";

    return (
        <>
            <header className="bg-eco-green text-white sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-6">
                        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
                            EcoVault
                        </Link>

                        {showSearch && (
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input 
                                      type="text" 
                                      placeholder="Search products..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent"
                                      />
                                </div>
                            </div>
                        )}

                        <button
                          onClick={() => setCartOpen(true)}
                          className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse ">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    )

}