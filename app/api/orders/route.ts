// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { createOrderRepository } from "@/lib/repositories/orders";
import { createOrderService } from "@/lib/services/orderService";

export async function GET() {
  try {
    const { adapter } = loadConfig();
    const repo = createOrderRepository(adapter);
    const orders = await repo.getAll();
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createOrderService(adapter);

    const body = await req.json();
    const { order, couponCode } = body; // <-- use couponCode (string), not full coupon object

    const created = await service.create(order, couponCode);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createOrderService(adapter);

    const body = await req.json();
    const { id, status } = body;

    const updated = await service.updateStatus(id, status);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createOrderService(adapter);

    const { id } = await req.json();
    const deleted = await service.delete(id);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
