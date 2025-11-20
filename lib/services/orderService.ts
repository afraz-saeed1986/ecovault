// src/lib/services/orderService.ts
import type { ID, CollectionDataSource } from "@/lib/db/adapters";
import type { Order, OrderItem } from "@/types";
import { createOrderRepository } from "@/lib/repositories/orders";
import { createCouponService } from "@/lib/services/couponService"; // <-- use coupon service

//calculate subtotal from items
function calcSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
}

//calculate totalPrice with discount, shipping, tax
function calcTotal(subtotal: number, discount?: number, shipping?: number, tax?: number): number {
  const d = discount ?? 0;
  const s = shipping ?? 0;
  const t = tax ?? 0;
  return subtotal - d + s + t;
}

export function createOrderService(dataSource: CollectionDataSource) {
  const orders = createOrderRepository(dataSource);
  const coupons = createCouponService(dataSource); // <-- initialize coupon service

  return {
    // create new order
    async create(
      orderInput: Omit<Order, "id" | "subtotal" | "totalPrice" | "createdAt" | "updatedAt">,
      couponCode?: string
    ): Promise<Order> {
      const subtotal = calcSubtotal(orderInput.items);

      let discount = 0;
      let appliedCouponCode: string | null = null;

      // if couponCode is provided, validate and apply via couponService
      if (couponCode) {
        const result = await coupons.applyCoupon(couponCode, subtotal);
        discount = result.discount;
        appliedCouponCode = result.coupon.code;
      }

      const totalPrice = calcTotal(subtotal, discount, orderInput.shipping, orderInput.tax);

      const toCreate: Omit<Order, "id"> = {
        ...orderInput,
        subtotal,
        discount,
        totalPrice,
        couponCode: appliedCouponCode ?? orderInput.couponCode ?? null,
        status: orderInput.status ?? "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return orders.create(toCreate);
    },

    //change order status
    async updateStatus(orderId: ID, status: Order["status"]): Promise<Order> {
      const existing = await orders.getById(orderId);
      if (!existing) throw new Error("Order not found");
      const updated = await orders.update({
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      });
      return updated;
    },

    //get order by id
    async getById(id: ID): Promise<Order | null> {
      return orders.getById(id);
    },

    //all orders list
    async list(): Promise<Order[]> {
      return orders.getAll();
    },

    //delete order
    async delete(id: ID): Promise<boolean> {
      return orders.delete(id);
    },
  };
}
