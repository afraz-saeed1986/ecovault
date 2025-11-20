// src/app/orders/[id]/page.tsx
import React from "react";
import Link from "next/link";
import { Order } from "@/types"; // <-- import existing Order type

// utils: format currency
function formatCurrency(value: number, currency = "IRR") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return new Intl.NumberFormat("en-US").format(value) + " " + currency;
  }
}

// server fetch
async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/orders/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load order");
  return res.json();
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h1 className="text-lg sm:text-xl font-bold">Order #{order.id}</h1>
        <span
          className={
            "inline-block rounded px-3 py-1 text-xs sm:text-sm " +
            (order.status === "paid"
              ? "bg-green-100 text-green-700"
              : order.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : order.status === "shipped"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700")
          }
        >
          Status: {order.status}
        </span>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded border p-4">
          <div className="text-xs sm:text-sm text-gray-500">Subtotal</div>
          <div className="text-base sm:text-lg font-semibold">{formatCurrency(order.subtotal, order.currency)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs sm:text-sm text-gray-500">Discount</div>
          <div className="text-base sm:text-lg font-semibold">
            {formatCurrency(order.discount ?? 0, order.currency)}
            {order.couponCode ? <span className="ml-2 text-xs text-gray-500">({order.couponCode})</span> : null}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs sm:text-sm text-gray-500">Shipping</div>
          <div className="text-base sm:text-lg font-semibold">{formatCurrency(order.shipping ?? 0, order.currency)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs sm:text-sm text-gray-500">Tax</div>
          <div className="text-base sm:text-lg font-semibold">{formatCurrency(order.tax ?? 0, order.currency)}</div>
        </div>
      </div>

      {/* Total */}
      <div className="rounded border p-4 mb-8 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Total Price</span>
          <span className="text-lg sm:text-xl font-bold">{formatCurrency(order.totalPrice, order.currency)}</span>
        </div>
      </div>

      {/* Items list */}
      <div className="rounded border">
        <div className="border-b p-4 font-semibold text-sm sm:text-base">Order Items</div>
        <ul>
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b last:border-b-0 gap-2"
            >
              <div>
                <div className="font-medium text-sm sm:text-base">{item.product.name}</div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Quantity: {item.quantity} {item.unit ?? item.product.unit ?? ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm text-gray-500">Unit Price</div>
                <div className="font-semibold text-sm sm:text-base">{formatCurrency(item.unitPrice, order.currency)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Meta info */}
      <div className="mt-6 text-xs sm:text-sm text-gray-500 space-y-1">
        <div>Created: {order.createdAt ? new Date(order.createdAt).toLocaleString("en-US") : "-"}</div>
        <div>Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString("en-US") : "-"}</div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href="/cart"
          className="w-full sm:w-auto text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Back to Cart
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
