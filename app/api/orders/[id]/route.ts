// src/app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { createOrderService } from "@/lib/services/orderService";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    const { adapter } = loadConfig();
    const service = createOrderService(adapter);

    const id = Number(ctx.params.id);

    
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await service.getById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
