"use client";

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { Product, OrderItemInput, CreateOrderInput } from "@/types";
import { useSupabaseSession } from "@/lib/supabase/hooks/use-supabase-session";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    totalPrice,
    // <--- این تابع رو از context اضافه کردیم (اگر نداری، setIsOpen(false) استفاده کن)
  } = useCart();

  const { user, loading } = useSupabaseSession();
  const currentUserId = user?.id ?? "guest-user-123";

  async function submitOrder() {
    try {
      const products: Product[] = await Promise.all(
        cart.map(async (ci) => {
          const res = await fetch(`/api/products/${ci.id}`, {
            cache: "no-store",
          });
          if (!res.ok) throw new Error(`Failed to fetch product ${ci.id}`);
          return res.json();
        })
      );

      const orderInput: CreateOrderInput = {
        user_id: currentUserId,

        items: cart.map((ci, idx) => {
          const product = products[idx];

          const itemInput: OrderItemInput = {
            product_id: ci.id,
            quantity: ci.quantity,
            unitPrice: product.price,
            totalPrice: product.price * ci.quantity,
            unit: product.unit ?? "pcs",
          };
          return itemInput;
        }),

        subtotal: products.reduce(
          (sum, p, idx) => sum + p.price * cart[idx].quantity,
          0
        ),
        discount: 0,
        shipping: 0,
        tax: 0,
        total_price: products.reduce(
          (sum, p, idx) => sum + p.price * cart[idx].quantity,
          0
        ),
        currency: products[0]?.currency ?? "USD",

        coupon_code: null,

        status: "pending",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderInput }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create order");
        return;
      }

      const created = await res.json();
      window.location.href = `/orders/${created.id}`;
    } catch (err) {
      alert((err as Error).message);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark mb-4">
          Your Cart is Empty
        </h1>
        <Link
          href="/"
          className="text-eco-green hover:underline text-sm sm:text-base"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark mb-6 sm:mb-8 dark:text-eco-light">
        Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4"
            >
              {/* وقتی روی عکس یا نام کلیک شد، سایدبار بسته بشه */}
              <Link href={`/product/${item.id}`}>
                <div className="relative w-full sm:w-24 h-48 sm:h-24">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-semibold text-base sm:text-lg">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="text-eco-green font-medium text-sm sm:text-base">
                    ${item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded border hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm sm:text-base">
                    {item.quantity}
                  </span>
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
          <button
            onClick={submitOrder}
            className="w-full bg-eco-green text-white py-3 rounded-lg mt-4 font-semibold hover:bg-eco-dark text-sm sm:text-base"
          >
            Checkout
          </button>
        </div>
      </div>
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-eco-green hover:text-eco-dark font-medium transition-colors dark:text-eco-accent dark:hover:text-eco-green"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
