"use client"

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
    const {cart, updateQuantity, removeFromCart,totalPrice} = useCart();

    if(cart.length === 0 ){
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">  
                <h1 className="text-3xl font-bold text-eco-dark mb-4">Your Cart is Empty</h1>
                <Link href="/" className="text-eco-green hover:underline">
                    Continiue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8"> 
            <h1 className="text-3xl font-bold text-eco-dark mb-8">Shopping Cart</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:sol-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow flex gap-4">
                            <div className="relative w-24 h-24">
                                <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-eco-green font-medium">${item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                 onClick={() => updateQuantity(item.id, item.quantity -1)}
                                 className="p-1 rounded border"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded border"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="bg-eco-light p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2"> 
                        <span>Total</span>
                        <span className="font-bold">${totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-eco-green text-white py-3 rounded-lg mt-4 font-semibold hover:bg-eco-dark">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    )
}