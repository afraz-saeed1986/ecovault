"use client";

import { useCart } from "@/components/CartContext"; 
import Image from "next/image";
import Link from "next/link";
import {X , ShoppingBag} from "lucide-react";
import { div, p } from "framer-motion/client";

export default function CartDropdown({isOpen, onClose}: {isOpen: boolean; onClose: () => void }){
    const {cart, removeFromCart, updateQuantity, totalPrice} = useCart();

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white h-full shadow-xl animate-slide-in-right">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Your Cart ({cart.length})
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                    <p className="text-eco-green font-semibold">${item.price}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-6 h-6 rounded border hover:bg-gray-200 text-xs"
                                    >
                                    -
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-6 h-6 rounded border hover:bg-gray-200 text-xs"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                 onClick={() => removeFromCart(item.id)}
                                 className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="border-t p-6 space-y-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={onClose}
                          className="block w-full bg-eco-green text-white text-center py-3 rounded-lg font-semibold hover:bg-eco-dark"
                        >
                         View full cart
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}