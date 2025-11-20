// src/app/api/coupons/route.ts
import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { createCouponService } from "@/lib/services/couponService";

export async function GET() {
  try {
    const { adapter } = loadConfig();
    const service = createCouponService(adapter);
    const coupons = await service.list();
    return NextResponse.json(coupons);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createCouponService(adapter);

    const body = await req.json();
    const created = await service.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createCouponService(adapter);

    const body = await req.json();
    const updated = await service.update(body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createCouponService(adapter);

    const { id } = await req.json();
    const deleted = await service.delete(id);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
