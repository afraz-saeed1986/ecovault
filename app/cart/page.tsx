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
                <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark mb-4">Your Cart is Empty</h1>
                <Link href="/" className="text-eco-green hover:underline text-sm sm:text-base">
                    Continiue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8"> 
            <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark mb-6 sm:mb-8 dark:text-eco-light">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
                             <Link href={`/product/${item.id}`} >
                                <div className="relative w-full sm:w-24 h-48 sm:h-24">
                                <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                            </div>
                             </Link>
                         
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                     <Link href={`/product/${item.id}`} >
                                        <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                                     </Link>
                                  
                                    <p className="text-eco-green font-medium text-sm sm:text-base">${item.price}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                    <button
                                     onClick={() => updateQuantity(item.id, item.quantity -1)}
                                     className="p-1 rounded border hover:bg-gray-50"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="p-1 rounded border hover:bg-gray-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 self-start sm:self-center"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="bg-eco-light p-6 rounded-lg h-fit sticky top-24">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2 text-sm sm:text-base"> 
                        <span>Total</span>
                        <span className="font-bold">${totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-eco-green text-white py-3 rounded-lg mt-4 font-semibold hover:bg-eco-dark text-sm sm:text-base">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    )
}