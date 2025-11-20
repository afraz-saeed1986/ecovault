// src/app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { createOrderService } from "@/lib/services/orderService";

export async function GET(_: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const { adapter } = loadConfig();
    const service = createOrderService(adapter);
    const {id} = await params;

    const orderId = Number(id);

    
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await service.getById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
